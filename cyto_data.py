import json

def make_cyto(dpp_item, cito_graph, assigned):

    if not dpp_item['id'] in assigned:
        assigned[dpp_item['id']] = {}
        data = {'data': {k:v for k,v in dpp_item.items() if k not in ['children']}}
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



if __name__ == "__main__":
    sub = 'gownshirt_trace'
    trace_file = f"../Interfacer-notebook/{sub}.json"
    # filename = "./isogown_trace.json"
    with open(trace_file,'r') as f:
            tot_dpp  = json.loads(f.read())

    cito_graph = {
        "nodes": [],
        "edges": []
    }
    assigned = {}
    make_cyto(tot_dpp[0], cito_graph, assigned)

    cyto_file = f'{sub}.cyto.json'
    with open(cyto_file,'w') as f:
            f.write(json.dumps(cito_graph, indent=2))

    # breakpoint()