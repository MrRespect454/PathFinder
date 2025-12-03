package ru.pathfinder.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller

public class WebController {
    @GetMapping("/")
    public String index()   
    {
        log.info("Loading index page");
        return "index"; 
    }      
    
    @GetMapping("/map")
    public String map() 
    {
        log.info("Loading map page");
        return "map";
    }

    @GetMapping("/register")
    public String register() 
    {
        log.info("Loading register page");
        return "register"; 
    }
    
  @GetMapping("/login")
    public String login()
     {
        log.info("Loading login page");
        return "login"; 
    } 
    
}
