import json

from if_dpp import er_before, get_dpp, convert_bedpp
from cyto_data import main_no_files
from if_groups import find_procgrp

ENDPOINT = 'http://zenflows-debug.interfacer.dyne.org/api'
CYTO_FILE = 'dpp.cyto.json'

USERS_DATA = {
    "designer2": {
        "username": "designer2_username",
        "keyring": {
            "eddsa": "9YjzDCUU6yKMv4UrLQJZtuUkzQmqpJ7EnY6RJkK5urHf"
        }
    }
}
def main(id, do_users, do_server, add_groups, compact):

    print(f"Resource to be traced: {id}")
    visited = set()
    
    if do_server:
        a_dpp = get_dpp(id, USERS_DATA['designer2'], endpoint=ENDPOINT)
        tot_dpp = convert_bedpp(a_dpp)
    else:
        a_dpp = []
        er_before(id, USERS_DATA['designer2'], dpp_children=a_dpp, depth=0, visited=visited, endpoint=ENDPOINT)
        tot_dpp = a_dpp[0]

    processgrp_data = {}
    find_procgrp(tot_dpp, processgrp_data, USERS_DATA['designer2'], endpoint=ENDPOINT)
    # breakpoint()
    cito_graph = main_no_files(tot_dpp, processgrp_data, do_users=do_users, add_groups=add_groups, compact=compact)

    with open(CYTO_FILE, 'w') as f:
        f.write(json.dumps(cito_graph, indent=2))
    print(f'{CYTO_FILE} written.')

if __name__ == "__main__":
    import argparse
    from six import text_type

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        '-a', '--add_groups',
        dest='add_groups',
        action='store_true',
        default=False,
        help='specifies whether to add groups to the graph',
    )

    parser.add_argument(
        '-c', '--compact',
        dest='compact',
        action='store_true',
        default=False,
        help='specifies whether to compact the nodes',
    )

    parser.add_argument(
        '-i', '--id',
        dest='id',
        type=text_type,
        nargs=1,
        default=[None],
        help='specifies the name of the id to generate the DPP for',
    )
    parser.add_argument(
        '-s', '--server_trace',
        dest='do_server',
        action='store_true',
        default=False,
        help='specifies whether to add group info as graph data',
    )

    parser.add_argument(
        '-u', '--users',
        dest='users',
        action='store_true',
        default=False,
        help='specifies whether to include users as nodes',
    )
    args, unknown = parser.parse_known_args()
    
    main(args.id[0], args.users, args.do_server, args.add_groups, args.compact)
