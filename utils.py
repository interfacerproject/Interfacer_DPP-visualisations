import json

def remove_loops(dpp_item):
    if dpp_item['type'] == 'EconomicResource':
        for child in dpp_item['children']:
            # breakpoint()
            if child['name'] == 'modify':
                # breakpoint()
                dpp_item['id'] = dpp_item['id'] + child['id']
                break
    for child in dpp_item['children']:
        remove_loops(child)

def convert_dpp(dpp):
    # breakpoint()
    conv_dpp = {k:v for k,v in dpp['node'].items()}
    conv_dpp['type'] = dpp['type']
    name = dpp['node']['name'] if 'name' in dpp['node'] else dpp['node']['action_id']
    conv_dpp['name'] = name
    dl = len(dpp['children'])
    conv_dpp['children'] = [{} for i in range(dl)]
    for ch in range(dl):
        conv_dpp['children'][ch] = convert_dpp(dpp['children'][ch])
    return conv_dpp

