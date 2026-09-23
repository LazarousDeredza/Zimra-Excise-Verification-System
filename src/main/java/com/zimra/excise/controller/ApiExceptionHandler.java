package com.zimra.excise.controller;
import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime; import java.util.Map;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(IllegalArgumentException.class) @ResponseStatus(HttpStatus.NOT_FOUND)
 public Map<String,Object> nf(IllegalArgumentException e){return Map.of("timestamp",LocalDateTime.now(),"error",e.getMessage());}
}
