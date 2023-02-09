import json

from if_utils import differentiate_resources, flatten_dict
from if_dpp import convert_bedpp


def make_cyto(dpp_item, cito_graph, assigned_nodes, assigned_users, do_users):

    if do_users and 'provider' in dpp_item:
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

    if do_users and 'receiver' in dpp_item:
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
        data = {'data': {k: v for k, v in flatten_dict(
            dpp_item).items() if k not in ['children']}}
        data['data']['origin'] = origin

        cito_graph['nodes'].append(data)

    # if 'provider' in dpp_item:
    #     data = {'data': {}}
    #     data['data']['source'] = dpp_item['provider']
    #     data['data']['target'] = dpp_item['id']
    #     cito_graph["edges"].append(data)
    # if 'receiver' in dpp_item:
    #     data = {'data': {}}
    #     data['data']['source'] = dpp_item['receiver']
    #     data['data']['target'] = dpp_item['id']
    #     cito_graph["edges"].append(data)

    nr_ch = len(dpp_item['children'])
    for ch in range(nr_ch):
        ch_dpp = dpp_item['children'][ch]
        data = {'data': {}}
        data['data']['source'] = ch_dpp['id']
        data['data']['target'] = dpp_item['id']

        cito_graph["edges"].append(data)

        make_cyto(ch_dpp, cito_graph, assigned_nodes=assigned_nodes,
                  assigned_users=assigned_users, do_users=do_users)
    return


def main(trace_file, group_file, do_users, add_as_data, add_as_node):

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
    make_cyto(tot_dpp, cito_graph['elements'], assigned_nodes, assigned_users, do_users)

    # Take care of the groups
    groups = {}
    if group_file is not None:
        with open(group_file, 'r') as f:
            groups = json.loads(f.read())
        # innefficient but should do
        if groups != {}:
            nodes = cito_graph['elements']['nodes']
            for key in groups.keys():
                group = groups[key]
                grp_data = {k: v for k,v in flatten_dict(group).items()}
                if add_as_node:
                    cito_graph['elements']['nodes'].append({'data': grp_data})
                    for child in group['groups']:
                        for node in nodes:
                            if node['data']['id'] == child:
                                node['data']['parent'] = group['id']
                if add_as_data:
                    cito_graph['groups'].append(grp_data)

    # breakpoint()
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
        help='specifies whether to include users',
    )
    args, unknown = parser.parse_known_args()

    main(args.filename[0], args.groups[0], args.users, args.add_as_data, args.add_as_node)
