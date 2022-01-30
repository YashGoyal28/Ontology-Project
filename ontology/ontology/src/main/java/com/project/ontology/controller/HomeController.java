package com.project.ontology.controller;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Component
public class HomeController {
    @GetMapping("/")
    public String home(Model model){
        return "home";
    }
}