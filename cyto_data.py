import json

def make_cyto(dpp_item, cito_graph, assigned):

    if not dpp_item['id'] in assigned:
        if assigned == {}:
            origin = True
        else:
            origin = False
        assigned[dpp_item['id']] = {}
        data = {'data': {k:v for k,v in dpp_item.items() if k not in ['children']}}
        data['data']['origin'] = origin
        cito_graph['nodes'].append(data)


    nr_ch = len(dpp_item['children'])
    for ch in range(nr_ch):
        ch_dpp = dpp_item['children'][ch]
        data = {'data': {}}
        data['data']['source'] = ch_dpp['id']
        data['data']['target'] = dpp_item['id']
        
        cito_graph["edges"].append(data)

        make_cyto(ch_dpp, cito_graph, assigned=assigned)
    return    

def remove_loops(dpp_item):
    if dpp_item['type'] == 'EconomicResource':
        for child in dpp_item['children']:
            if child['name'] == 'modify':
                # breakpoint()
                dpp_item['id'] = dpp_item['id'] + child['id']
                break
    for child in dpp_item['children']:
        remove_loops(child)


def main(filename):

    trace_file = f"../Interfacer-notebook/{filename}.json"
    # filename = "./isogown_trace.json"
    with open(trace_file,'r') as f:
            tot_dpp  = json.loads(f.read())

    remove_loops(tot_dpp[0])

    cito_graph = {
        "nodes": [],
        "edges": []
    }
    assigned = {}
    make_cyto(tot_dpp[0], cito_graph, assigned)

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
    args, unknown = parser.parse_known_args()

    main(args.filename[0])



