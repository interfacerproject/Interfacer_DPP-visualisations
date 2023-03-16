# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import json

from if_utils import flatten_dict
from if_dpp import differentiate_resources, convert_bedpp


def is_in_compact(dpp_item):
    """
        This function checks whether the node must be present
        in the compacted form
    """
    if dpp_item['type'] == "EconomicResource" or dpp_item['type'] == "Process":
        return True
    if dpp_item['type'] == "EconomicEvent":
        action = dpp_item['action']['id']
        if action in ["transfer", "transferAllRights", "transferCustody"]:
            return True
    return False


def make_cyto(dpp_item, cito_graph, assigned_nodes, assigned_users, do_users, compact, pending_edge):

    # Do we want to add users as nodes in the graph?
    if do_users:
        if 'provider' in dpp_item:
            id = dpp_item['provider']['id']
            if not id in assigned_users:
                user = {'data': {k: v for k, v in flatten_dict(
                    dpp_item['provider']).items()}}
                user['data']['id'] = id
                cito_graph['nodes'].append(user)
                assigned_users.add(id)
            data = {'data': {}}
            data['data']['source'] = id
            data['data']['target'] = dpp_item['id']
            cito_graph["edges"].append(data)
        elif 'receiver' in dpp_item:
            id = dpp_item['receiver']['id']
            if not id in assigned_users:
                user = {'data': {k: v for k, v in flatten_dict(
                    dpp_item['receiver']).items()}}
                user['data']['id'] = id
                cito_graph['nodes'].append(user)
                assigned_users.add(id)
            data = {'data': {}}
            data['data']['source'] = dpp_item['id']
            data['data']['target'] = id
            cito_graph["edges"].append(data)

    # process node if not alredy done
    if not dpp_item['id'] in assigned_nodes:
        if len(assigned_nodes) == 0:
            # List is empty, this is the origin
            origin = True
        else:
            origin = False
        assigned_nodes.add(dpp_item['id'])
        # breakpoint()
        if not compact or (compact and is_in_compact(dpp_item)):
            # The node should be in the graph
            data = {'data': {k: v for k, v in flatten_dict(
                dpp_item).items() if k not in ['children']}}
            data['data']['origin'] = origin

            cito_graph['nodes'].append(data)

        if compact and is_in_compact(dpp_item):
            # we are compacting, so keep track of edges
            # of nodes that are in the compacted version,
            # as not all nodes will be linked
            if pending_edge['target'] == None:
                pending_edge['target'] = dpp_item['id']
            else:
                pending_edge['source'] = dpp_item['id']
                data = {'data': {
                    'source': pending_edge['source'],
                    'target': pending_edge['target'],
                }}
                cito_graph["edges"].append(data)
                pending_edge = {
                    'target': dpp_item['id']
                }

    # examine children
    nr_ch = len(dpp_item['children'])
    for ch in range(nr_ch):
        ch_dpp = dpp_item['children'][ch]
        if not compact:
            # add the edge only if we are not compacting,
            # otherwise we use pending_edge
            data = {'data': {}}
            data['data']['source'] = ch_dpp['id']
            data['data']['target'] = dpp_item['id']

            cito_graph["edges"].append(data)

        make_cyto(ch_dpp, cito_graph, assigned_nodes=assigned_nodes,
                  assigned_users=assigned_users, do_users=do_users, compact=compact, pending_edge=pending_edge)
    return


def main_no_files(tot_dpp, groups, do_users, compact):

    if compact:
        # we are showing less nodes so no user nodes
        do_users = False

    if groups == {}:
        add_groups = False
    else:
        add_groups = True
    # breakpoint()
    differentiate_resources(tot_dpp)

    cito_graph = {
        "elements": {
            "nodes": [],
            "edges": []
        },
        "groups": [],
        "flags": [],
    }
    assigned_nodes = set()
    assigned_users = set()

    if compact:
        pending_edge = {
            'source': None,
            'target': None
        }
        cito_graph['flags'].append('compact')
    else:
        pending_edge = {}

    make_cyto(tot_dpp, cito_graph['elements'], assigned_nodes,
              assigned_users, do_users, compact, pending_edge)

    # nodes = cito_graph['elements']['nodes']
    # edges = cito_graph['elements']['edges']

    # Take care of the groups
    if add_groups:
        for key in groups.keys():
            group = groups[key]
            grp_data = {k: v for k, v in flatten_dict(group).items()}
            cito_graph['groups'].append(grp_data)

    # breakpoint()

    return cito_graph


def main(trace_file, group_file, do_users, compact):

    with open(trace_file, 'r') as f:
        a_dpp = json.loads(f.read())
        a_dpp = a_dpp[0]

    # breakpoint()
    if 'node' in a_dpp:
        tot_dpp = convert_bedpp(a_dpp)
    else:
        tot_dpp = a_dpp

    groups = {}
    if group_file is not None:
        with open(group_file, 'r') as f:
            groups = json.loads(f.read())

    cito_graph = main_no_files(tot_dpp, groups, do_users, compact)

    cyto_file = 'dpp.cyto.json'
    with open(cyto_file, 'w') as f:
        f.write(json.dumps(cito_graph, indent=2))

    # breakpoint()
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        '-c', '--compact',
        dest='compact',
        action='store_true',
        default=False,
        help='specifies whether to compact the nodes',
    )

    parser.add_argument(
        '-f', '--filename',
        dest='filename',
        action='store',
        default='',
        required=True,
        help='specifies the name of the trace file',
    )

    parser.add_argument(
        '-g', '--groups',
        dest='groups',
        action='store',
        default=None,
        help='the name of the file specifying the groups (implies adding groups)',
    )

    parser.add_argument(
        '-u', '--users',
        dest='users',
        action='store_true',
        default=False,
        help='specifies whether to include users as nodes',
    )
    args, unknown = parser.parse_known_args()

    if len(unknown) > 0:
        print(f'Unknown options {unknown}')
        parser.print_help()
        exit(-1)

    main(args.filename, args.groups, args.users, args.compact)
