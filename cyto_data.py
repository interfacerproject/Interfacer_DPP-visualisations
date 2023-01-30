import json

from if_utils import differentiate_resources
from if_dpp import convert_bedpp

def make_cyto(dpp_item, cito_graph, assigned_nodes,assigned_users, do_users):

    if do_users and 'provider' in dpp_item:
        if not dpp_item['provider']['id'] in assigned_users:
            user = {'data': {k:v for k,v in dpp_item['provider'].items()}}
            cito_graph['nodes'].append(user)
            assigned_users.add(dpp_item['provider']['id'])
        data = {'data': {}}
        data['data']['source'] = dpp_item['provider']['id']
        data['data']['target'] = dpp_item['id']
        cito_graph["edges"].append(data)

    if do_users and 'receiver' in dpp_item:
        if not dpp_item['receiver']['id'] in assigned_users:
            user = {'data': {k:v for k,v in dpp_item['receiver'].items()}}
            cito_graph['nodes'].append(user)
            assigned_users.add(dpp_item['receiver']['id'])
        data = {'data': {}}
        data['data']['source'] = dpp_item['id']
        data['data']['target'] = dpp_item['receiver']['id']
        cito_graph["edges"].append(data)

    if not dpp_item['id'] in assigned_nodes:
        
        if len(assigned_nodes) == 0:
            origin = True
        else:
            origin = False
        assigned_nodes.add(dpp_item['id'])
        data = {'data': {k:v for k,v in dpp_item.items() if k not in ['children']}}
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

        make_cyto(ch_dpp, cito_graph, assigned_nodes=assigned_nodes, assigned_users=assigned_users, do_users=do_users)
    return    

def main(trace_file, do_users):

    with open(trace_file,'r') as f:
            a_dpp  = json.loads(f.read())

    if 'node' in a_dpp:
        tot_dpp = convert_bedpp(a_dpp)
    else:
        tot_dpp = a_dpp[0]

    # breakpoint()
    differentiate_resources(tot_dpp)

    cito_graph = {
        "nodes": [],
        "edges": []
    }
    assigned_nodes = set()
    assigned_users = set()
    make_cyto(tot_dpp, cito_graph, assigned_nodes, assigned_users, do_users)

    cyto_file = 'dpp.cyto.json'
    with open(cyto_file,'w') as f:
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
        '-f', '--filename',
        dest='filename',
        type=text_type,
        nargs=1,
        default='',
        help='specifies the name of the dpp file',
    )

    parser.add_argument(
        '-u', '--users',
        dest='users',
        action='store_true',
        default=False,
        help='specifies whether to include users',
    )
    args, unknown = parser.parse_known_args()

    main(args.filename[0], args.users)



