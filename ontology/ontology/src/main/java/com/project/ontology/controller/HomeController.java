package com.project.ontology.controller;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Hashtable;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.ObjectProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFWriterI;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.function.library.date;
import org.apache.jena.vocabulary.XSD;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import opennlp.tools.namefind.NameFinderME;
import opennlp.tools.namefind.TokenNameFinderModel;
import opennlp.tools.tokenize.SimpleTokenizer;
import opennlp.tools.util.Span;

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
        Hashtable<String, String> data = new Hashtable<String, String>();
        String dataTypeName = req.getParameter("datatypeName");
        datatypes.get(dataTypeName).remove();

        data.put("result", "success");
        return ResponseEntity.ok(data); 
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
        Hashtable<String, String> data = new Hashtable<String, String>();
        String range = req.getParameter("range");
        String domain = req.getParameter("domain");
        nodes.get(range).removeSubClass(nodes.get(domain));

        data.put("result", "success");
        return ResponseEntity.ok(data); 
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
        Hashtable<String, String> data = new Hashtable<String, String>();
        String propertyName = req.getParameter("propertyName");
        objectProperty.get(propertyName).remove();

        data.put("result", "success");
        return ResponseEntity.ok(data); 
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
        // System.out.println(session.getAttribute("path"));
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

    @GetMapping("/process")
    public String process(Model model, HttpSession session) throws Exception{
        SimpleTokenizer tokenizer = SimpleTokenizer.INSTANCE;
        String[] tokens = tokenizer.tokenize("John has a friend whose name is Eden. They live in England. They work for BMW. They met on 5th January. They earn 10000 every month. They donate 20%.");
        ArrayList <String> names = new ArrayList<>(), organization = new ArrayList<>(), location = new ArrayList<>(), date = new ArrayList<>(), money = new ArrayList<>(), percentage = new ArrayList<>(), time = new ArrayList<>();
        // Name Finder
        InputStream inputStreamNameFinder = getClass().getResourceAsStream("/models/en-ner-person.bin");
        TokenNameFinderModel nfmodel = new TokenNameFinderModel(inputStreamNameFinder);
        NameFinderME nameFinderME = new NameFinderME(nfmodel);
        for(Span i : nameFinderME.find(tokens)){
            names.add(tokens[i.getStart()]);
            // System.out.println(tokens[i.getStart()]);
        }
        for (String s : names){
            HttpServletRequest new_req;
            new_req.setAttribute(name, o);
            addClass(model, req, session)
        }
        //Location Finder
        InputStream inputStreamLocationFinder = getClass().getResourceAsStream("/models/en-ner-location.bin");
        TokenNameFinderModel lfmodel = new TokenNameFinderModel(inputStreamLocationFinder);
        NameFinderME locationFinderME = new NameFinderME(lfmodel);
        for(Span i : locationFinderME.find(tokens)){
            location.add(tokens[i.getStart()]);
            // System.out.println(tokens[i.getStart()]);
        }
        //Organization Finder
        InputStream inputStreamOrganizationFinder = getClass().getResourceAsStream("/models/en-ner-organization.bin");
        TokenNameFinderModel ofmodel = new TokenNameFinderModel(inputStreamOrganizationFinder);
        NameFinderME organizationFinderME = new NameFinderME(ofmodel);
        for(Span i : organizationFinderME.find(tokens)){
            organization.add(tokens[i.getStart()]);
            // System.out.println(tokens[i.getStart()]);
        }
        //Date Finder
        InputStream inputStreamDateFinder = getClass().getResourceAsStream("/models/en-ner-date.bin");
        TokenNameFinderModel dfmodel = new TokenNameFinderModel(inputStreamDateFinder);
        NameFinderME dateFinderME = new NameFinderME(dfmodel);
        for(Span i : dateFinderME.find(tokens)){
            date.add(tokens[i.getStart()]);
            System.out.println(i.getStart());
            System.out.println(i.getEnd());
        }
        //Money Finder
        InputStream inputStreamMoneyFinder = getClass().getResourceAsStream("/models/en-ner-money.bin");
        TokenNameFinderModel mfmodel = new TokenNameFinderModel(inputStreamMoneyFinder);
        NameFinderME moneyFinderME = new NameFinderME(mfmodel);
        for(Span i : moneyFinderME.find(tokens)){
            // money.add(tokens[i.getStart()]);
            System.out.println(i.getStart());
            System.out.println(i.getEnd());
        }
        //Percentage Finder
        InputStream inputStreamPercentageFinder = getClass().getResourceAsStream("/models/en-ner-percentage.bin");
        TokenNameFinderModel pfmodel = new TokenNameFinderModel(inputStreamPercentageFinder);
        NameFinderME percentageFinderME = new NameFinderME(pfmodel);
        for(Span i : percentageFinderME.find(tokens)){
            percentage.add(tokens[i.getStart()]);
        }
        //Time Finder
        InputStream inputStreamTimeFinder = getClass().getResourceAsStream("/models/en-ner-time.bin");
        TokenNameFinderModel tfmodel = new TokenNameFinderModel(inputStreamTimeFinder);
        NameFinderME timeFinderME = new NameFinderME(tfmodel);
        for(Span i : timeFinderME.find(tokens)){
            time.add(tokens[i.getStart()]);
            // System.out.println(tokens[i.getStart()]);
        }
        return "home";
    }
}