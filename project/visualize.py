import rdflib
from pyvis.network import Network


def detect_rdf_format(file_path):
    formats = ["xml", "n3", "turtle", "nt", "trig", "nquads", "json-ld"]
    for rdf_format in formats:
        try:
            g = rdflib.Graph()
            g.parse(file_path, format=rdf_format)
            print(f"RDF format detected: {rdf_format}")
            return rdf_format
        except Exception as e:
            continue
    raise ValueError("Unable to detect RDF format.")


# Load your RDF file and detect its format
file_path = "./visualize.txt"
rdf_format = detect_rdf_format(file_path)

g = rdflib.Graph()
g.parse(file_path, format=rdf_format)

# Create a PyVis network
net = Network(directed=True)

# Define node and edge styles
node_styles = {
    'subject': {'color': 'skyblue', 'shape': 'box'},
    'object': {'color': 'lightgreen', 'shape': 'ellipse'},
    'predicate': {'color': 'orange', 'shape': 'triangle'}
}

# Add nodes and edges from RDF graph with custom styles
for s, p, o in g:
    net.add_node(str(s), label=str(s), **node_styles['subject'])
    net.add_node(str(o), label=str(o), **node_styles['object'])
    net.add_edge(str(s), str(o), title=str(p), **node_styles['predicate'])

# Set network options
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

# Generate the HTML content
html_content = net.generate_html(notebook=False)


# Write the modified HTML content to a file
with open("./views/rdf_graph.html", "w") as f:
    f.write(html_content)
