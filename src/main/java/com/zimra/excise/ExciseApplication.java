package com.zimra.excise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;

import java.math.BigDecimal;

//@SpringBootApplication
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class ExciseApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExciseApplication.class, args);


	}

}
