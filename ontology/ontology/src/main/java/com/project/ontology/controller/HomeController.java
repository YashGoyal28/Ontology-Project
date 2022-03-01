package com.project.ontology.controller;

import java.io.FileOutputStream;
import java.util.Hashtable;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.websocket.RemoteEndpoint.Async;

import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.ObjectProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFWriterI;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.XSD;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@Component
public class HomeController {
    private String NS = "https://www.xfront.com/owl/ontologies/camera/#";
    private String xmlbase = "https://www.xfront.com/owl/ontologies/camera/";
    // private String NS = "D:/Spring/AKT PROJECT/Ontology-Project/ontology/ontology/ns/#";
    // private String xmlbase = "D:/Spring/AKT PROJECT/Ontology-Project/ontology/ontology/ns/";
    private OntModel m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    private Resource NAMESPACE = m.createResource(NS);
    private RDFWriterI rdfw=m.getWriter("RDF/XML-ABBREV");
    private Hashtable<String,OntClass> nodes = new Hashtable<>();
    private Hashtable<String,DatatypeProperty> datatypes = new Hashtable<>();
    private Hashtable<String,ObjectProperty> objectProperty = new Hashtable<>();
    
    @GetMapping("/")
    public String home(Model model, HttpSession session) throws Exception{
        if(session.getAttribute("count") == null){
            session.setAttribute("count", 0);
        }
        m.close();
        m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        nodes.clear();
        datatypes.clear();
        objectProperty.clear();
        rdfw.setProperty("xmlbase", xmlbase);
        m.setNsPrefix("ont",NS);
        return "home";
    }
    
    @PostMapping("/add_class")
    public ResponseEntity<?> addClass(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        Hashtable<String, String> data = new Hashtable<String, String>();
        String className = req.getParameter("className");
        String label = req.getParameter("label");
        OntClass newClass =  m.createClass(NS+className);
        newClass.addLabel(label,"en");
        nodes.put(className, newClass);

        data.put("result", "success");
        return ResponseEntity.ok(data); 
    }

    @PostMapping("/delete_class")
    public ResponseEntity<?> deleteClass(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        Hashtable<String, String> data = new Hashtable<String, String>();
        String className = req.getParameter("className");
        nodes.get(className).remove();
        
        data.put("result", "success");
        return ResponseEntity.ok(data); 
    }

    @PostMapping("/add_datatype")
    public ResponseEntity<?> addDataType(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        Hashtable<String, String> data = new Hashtable<String, String>();
        String className = req.getParameter("className");
        String type = req.getParameter("type");
        String label = req.getParameter("label");
        String DatatypeName = req.getParameter("datatypeName");
        DatatypeProperty newProperty = m.createDatatypeProperty(NS+DatatypeName);
        newProperty.addDomain(nodes.get(className));
        switch(type){
            case("boolean"):
                newProperty.addRange(XSD.xboolean);
                break;
            case("integer"):
                newProperty.addRange(XSD.xint);
                break;
            case("double"):
                newProperty.addRange(XSD.xdouble);
                break;
            case("string"):
                newProperty.addRange(XSD.xstring);
                break;
        }
        newProperty.addLabel(label,"en");
        datatypes.put(DatatypeName, newProperty);
        
        data.put("result", "success");
        return ResponseEntity.ok(data); 
    }

    @PostMapping("/delete_datatye")
    public ResponseEntity<?> deleteDatatype(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        String dataTypeName = req.getParameter("datatypeName");
        datatypes.get(dataTypeName).remove();
        return ResponseEntity.ok("end");
    }

    @PostMapping("/add_sub_class")
    public ResponseEntity<?> addSubClass(Model model, HttpServletRequest req) throws Exception{
        Hashtable<String, String> data = new Hashtable<String, String>();
        String domain = req.getParameter("domain");
        String range = req.getParameter("range");
        // String propertyName = req.getParameter("propertyName");
        nodes.get(range).addSubClass(nodes.get(domain));

        data.put("result", "success");
        return ResponseEntity.ok(data); 
    }

    @PostMapping("/delete_sub_class")
    public ResponseEntity<?> deleteSubClass(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        String range = req.getParameter("range");
        String domain = req.getParameter("domain");
        nodes.get(range).removeSubClass(nodes.get(domain));
        return ResponseEntity.ok("end");
    }
    
    @PostMapping("/add_object_property")
    public ResponseEntity<?> addObjectProperty(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        Hashtable<String, String> data = new Hashtable<String, String>();
        String domain = req.getParameter("domain");
        String range = req.getParameter("range");
        String label = req.getParameter("label");
        String propertyName = req.getParameter("propertyName");
        ObjectProperty newProperty = m.createObjectProperty(propertyName);
        newProperty.addLabel(label,"en");
        newProperty.addDomain(nodes.get(domain));
        newProperty.addRange(nodes.get(range));
        objectProperty.put(propertyName, newProperty);

        data.put("result", "success");
        return ResponseEntity.ok(data); 
    }

    @PostMapping("/delete_object_property")
    public ResponseEntity<?> deleteObjectProperty(Model model, HttpServletRequest req, HttpSession session) throws Exception{
        String propertyName = req.getParameter("propertyName");
        objectProperty.get(propertyName).remove();
        return ResponseEntity.ok("end");
    }

    @PostMapping("/generate")
    public String createOntology(HttpSession session) throws Exception{
        Integer cnt = Integer.parseInt(session.getAttribute("count").toString());
        FileOutputStream myWriter = new FileOutputStream("src/main/resources/static/ontology/ont" + cnt.toString() + ".txt");
        m.write(myWriter,"RDF/XML-ABBREV", xmlbase);
        myWriter.close();
        myWriter = new FileOutputStream("src/main/resources/static/ontology/ont" + cnt.toString() + ".owl");
        m.write(myWriter,"RDF/XML-ABBREV", xmlbase);
        myWriter.close();

        m.close();
        m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        session.setAttribute("path", "/ontology/ont" + cnt.toString() + ".txt");
        session.setAttribute("download_path", "/ontology/ont" + cnt.toString() + ".owl");
        System.out.println(session.getAttribute("path"));
        cnt++;
        session.setAttribute("count", cnt);
        return "redirect:/ontology";
    }

    @GetMapping("/ontology")
    public String displayOntology(Model model, HttpSession session){
        try {
            Thread.sleep(1 * 1000);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
        return "ontology";
    }
}