import plotly.graph_objects as go
import json

from if_utils import differentiate_resources
from if_dpp import convert_bedpp
from if_graphics import make_sankey, vis_dpp, consol_trace


def main(trace_file):

    with open(trace_file,'r') as f:
            a_dpp  = json.loads(f.read())

    if 'node' in a_dpp:
        tot_dpp = convert_bedpp(a_dpp)
    else:
        tot_dpp = a_dpp[0]

    # make resource ids unique in the flow
    # differentiate_resources(tot_dpp)

    labels = []
    sources = []
    targets = []
    values = []
    color_nodes = []
    color_links = []
    assigned = {}
    vis_dpp(tot_dpp, count=0, assigned=assigned, labels=labels, targets=targets, sources=sources, values=values, color_nodes=color_nodes, color_links=color_links)
    sources, targets = consol_trace(assigned, sources, targets)
    make_sankey(sources, targets, labels, values, color_nodes, color_links)

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
