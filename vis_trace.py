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
