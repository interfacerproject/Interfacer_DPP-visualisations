import json

from if_dpp import er_before
from cyto_data import main_no_files

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
def main(id, do_users, add_as_data, compact):

    print(f"Resource to be traced: {id}")
    tot_dpp = []
    visited = set()
    er_before(id, USERS_DATA['designer2'], dpp_children=tot_dpp, depth=0, visited=visited, endpoint=ENDPOINT)

    groups = {}

    cito_graph = main_no_files(tot_dpp, groups, do_users=do_users, add_as_data=add_as_data, add_as_node=False, compact=compact)


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
        '-i', '--id',
        dest='id',
        type=text_type,
        nargs=1,
        default=[None],
        help='specifies the name of the id to generate the DPP for',
    )

    parser.add_argument(
        '-u', '--users',
        dest='users',
        action='store_true',
        default=False,
        help='specifies whether to include users as nodes',
    )
    args, unknown = parser.parse_known_args()

    main(args.id[0], args.users, args.add_as_data, args.compact)
