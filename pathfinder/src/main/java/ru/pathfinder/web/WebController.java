package ru.pathfinder.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller

public class WebController {
    @GetMapping("/")
    public String index()   
    {
        return "index"; 
    }      
    
    @GetMapping("/map")
    public String map() 
    {
        return "map";
    }

    @GetMapping("/register")
    public String register() 
    {
        return "register"; 
    }
    
    @GetMapping("/login")
    public String login()
     {
        return "login"; 
    }
    
}
