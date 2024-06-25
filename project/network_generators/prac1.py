from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF

# Create a Graph
g = Graph()

# Define namespaces
PERS = Namespace("http://gndec.ac.in/Personal#")
BASE = Namespace("http://gndec.ac.in/Student#")

# Bind namespaces
g.bind("rdf", RDF)
g.bind("pers", PERS)
g.bind("base", BASE)

# Add triples
sahib = BASE.Sahib
g.add((sahib, PERS.hasPhoneNumber, Literal("1234567890")))
g.add((sahib, PERS.WritesBlog, URIRef("http://semweb2024.blogpost.com")))

# Print the graph in Turtle format
print(g.serialize(format="pretty-xml"))
