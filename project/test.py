import rdflib
from pyvis.network import Network

# Load your RDF file
g = rdflib.Graph()
g.parse("./input.rdf")

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

# Visualize the graph
net.show("./views/rdf_graph.html", notebook=False)
