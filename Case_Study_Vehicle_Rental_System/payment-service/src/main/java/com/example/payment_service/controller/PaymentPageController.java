package com.example.payment_service.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaymentPageController {

    /**
     * Load payment page.
     */
    @GetMapping("/payment")
    public String paymentPage() {
        return "payment";
    }
}