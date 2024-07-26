import rdflib
import sys
from pyvis.network import Network


def detect_rdf_format(rdf_data):
    formats = ["xml", "n3", "turtle", "nt", "trig", "nquads", "json-ld"]
    for rdf_format in formats:
        try:
            g = rdflib.Graph()
            g.parse(data=rdf_data, format=rdf_format)
            return rdf_format
        except Exception:
            continue


if __name__ == "__main__":
    input_data = sys.stdin.read()
    rdf_format = detect_rdf_format(input_data)

    g = rdflib.Graph()
    g.parse(data=input_data, format=rdf_format)

    net = Network(directed=True)

    node_styles = {
        'subject': {'color': 'skyblue', 'shape': 'box'},
        'object': {'color': 'lightgreen', 'shape': 'ellipse'},
        'predicate': {'color': 'orange', 'shape': 'triangle'}
    }

    for s, p, o in g:
        net.add_node(str(s), label=str(s), **node_styles['subject'])
        net.add_node(str(o), label=str(o), **node_styles['object'])
        net.add_edge(str(s), str(o), title=str(p), **node_styles['predicate'])

    options = """
    var options = {
        "nodes": {
            "font": {
                "size": 20,
                "face": "Arial"
            }
        },
        "edges": {
            "color": {
                "inherit": true
            },
            "smooth": {
                "type": "dynamic"
            }
        },
        "physics": {
            "barnesHut": {
                "gravitationalConstant": -5000,
                "springLength": 150,
                "springConstant": 0.005
            },
            "minVelocity": 0.75
        },
        "interaction": {
            "dragNodes": true,
            "dragView": true,
            "zoomView": true
        },
        "manipulation": {
            "enabled": true
        },
        "layout": {
            "hierarchical": {
                "enabled": false
            }
        }
    }
    """
    net.set_options(options)

    html_content = net.generate_html(notebook=False)
    print(html_content)
