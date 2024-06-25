import rdflib
from pyvis.network import Network

# Load your RDF file
g = rdflib.Graph()
g.parse("../../books/out.ttl")

# Create a PyVis network
net = Network(directed=True)

# Add nodes and edges from RDF graph
for s, p, o in g:
    net.add_node(str(s), label=str(s))
    net.add_node(str(o), label=str(o))
    net.add_edge(str(s), str(o), title=str(p))

# Visualize the graph
net.show("rdf_graph.html", notebook=False)
