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

from if_utils import differentiate_resources, flatten_dict
from if_dpp import convert_bedpp


def make_cyto(dpp_item, cito_graph, assigned_nodes, assigned_users, do_users, compact, pending_edge):

    if do_users:
        if 'provider' in dpp_item:
        
            # id = dpp_item['id'] + dpp_item['provider']['id']
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
            # id = dpp_item['id'] + dpp_item['receiver']['id']
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

    if not dpp_item['id'] in assigned_nodes:

        if len(assigned_nodes) == 0:
            origin = True
        else:
            origin = False
        assigned_nodes.add(dpp_item['id'])
        # breakpoint()
        if (compact and (dpp_item['type'] ==  "EconomicResource" or dpp_item['type'] ==  "Process")) or not compact:
            data = {'data': {k: v for k, v in flatten_dict(
                dpp_item).items() if k not in ['children']}}
            data['data']['origin'] = origin

            cito_graph['nodes'].append(data)
        if compact and (dpp_item['type'] ==  "EconomicResource" or dpp_item['type'] ==  "Process"):
            if pending_edge['target'] == None:
                pending_edge['target'] = dpp_item['id']
            else:
                pending_edge['source'] = dpp_item['id']
                data = {'data': {
                    'source' : pending_edge['source'],
                    'target' : pending_edge['target'],
                }}
                cito_graph["edges"].append(data)
                pending_edge = {
                    'target': dpp_item['id']
                }


    nr_ch = len(dpp_item['children'])
    for ch in range(nr_ch):
        ch_dpp = dpp_item['children'][ch]
        if not compact:
            data = {'data': {}}
            data['data']['source'] = ch_dpp['id']
            data['data']['target'] = dpp_item['id']

            cito_graph["edges"].append(data)

        make_cyto(ch_dpp, cito_graph, assigned_nodes=assigned_nodes,
                  assigned_users=assigned_users, do_users=do_users, compact=compact, pending_edge=pending_edge)
    return

def consolidate_edges(first_id, second_id, remove_ids, edges):
    for i, edge in enumerate(edges):
        if edge['data']['source'] in remove_ids and edge['data']['target'] in remove_ids:
            breakpoint()
            del edges[i]
        elif edge['data']['source'] in remove_ids:
            breakpoint()
            edge['data']['source'] = first_id
        elif edge['data']['target'] in remove_ids:
            breakpoint()
            edge['data']['target'] = second_id



def main(trace_file, group_file, do_users, add_as_data, add_as_node, compact):

    if compact:
        # we are showing less nodes so no user nodes
        do_users = False

    with open(trace_file, 'r') as f:
        a_dpp = json.loads(f.read())

    if 'node' in a_dpp:
        tot_dpp = convert_bedpp(a_dpp)
    else:
        tot_dpp = a_dpp[0]

    # breakpoint()
    differentiate_resources(tot_dpp)

    cito_graph = {
        "elements": {
            "nodes": [],
            "edges": []
        },
        "groups": []
    }
    assigned_nodes = set()
    assigned_users = set()
    pending_edge = {
        'source': None,
        'target': None
    }
    make_cyto(tot_dpp, cito_graph['elements'], assigned_nodes, assigned_users, do_users, compact, pending_edge)

    nodes = cito_graph['elements']['nodes']
    edges = cito_graph['elements']['edges']
    # Take care of the groups
    groups = {}
    if group_file is not None:
        with open(group_file, 'r') as f:
            groups = json.loads(f.read())
        # innefficient but should do
        if groups != {}:
            for key in groups.keys():
                group = groups[key]
                grp_data = {k: v for k,v in flatten_dict(group).items()}
                if add_as_node:
                    cito_graph['elements']['nodes'].append({'data': grp_data})
                    for child in group['groups']:
                        for node in nodes:
                            if node['data']['id'] == child:
                                node['data']['parent'] = group['id']
                                break
                if add_as_data:
                    cito_graph['groups'].append(grp_data)

    # breakpoint()
    if compact:
        first_id = second_id = None
        remove_ids = []
        for i, node in enumerate(nodes):
            if node['data']['type'] ==  "EconomicResource" or node['data']['type'] ==  "Process":
                if first_id == None:
                    first_id = node['data']['id']
                else:
                    # found a target
                    # breakpoint()
                    second_id = node['data']['id']
                    consolidate_edges(first_id, second_id, remove_ids, edges)
                    first_id = second_id = None
                    remove_ids = []
            else:
                remove_ids.append(node['data']['id'])
                # pop the node
                del nodes[i]

    cyto_file = 'dpp.cyto.json'
    with open(cyto_file, 'w') as f:
        f.write(json.dumps(cito_graph, indent=2))

    # breakpoint()
if __name__ == "__main__":
    import argparse
    from six import text_type

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
        '-d', '--add_as_data',
        dest='add_as_data',
        action='store_true',
        default=False,
        help='specifies whether to add group info as graph data',
    )

    parser.add_argument(
        '-f', '--filename',
        dest='filename',
        type=text_type,
        nargs=1,
        default='',
        help='specifies the name of the dpp file',
    )

    parser.add_argument(
        '-g', '--groups',
        dest='groups',
        type=text_type,
        nargs=1,
        default=[None],
        help='specifies the name of the file specifying the groups',
    )

    parser.add_argument(
        '-n', '--add_as_node',
        dest='add_as_node',
        action='store_true',
        default=False,
        help='specifies whether to add group info as nodes',
    )

    parser.add_argument(
        '-u', '--users',
        dest='users',
        action='store_true',
        default=False,
        help='specifies whether to include users as nodes',
    )
    args, unknown = parser.parse_known_args()

    main(args.filename[0], args.groups[0], args.users, args.add_as_data, args.add_as_node, args.compact)
