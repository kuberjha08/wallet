package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.entity.User;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    public void sendPaymentNotification(User payer, User payee, Double amount) {
        // In real app, send push notification/email/SMS
        System.out.println("💸 Payment Notification:");
        System.out.println("To: " + payee.getMobile());
        System.out.println("From: " + payer.getMobile());
        System.out.println("Amount: ₹" + amount);
        System.out.println("Message: You received ₹" + amount + " from " + payer.getName());
    }
    
    public void sendPaymentRequestNotification(User requester, User target, Double amount) {
        System.out.println("📩 Payment Request:");
        System.out.println("To: " + target.getMobile());
        System.out.println("From: " + requester.getMobile());
        System.out.println("Amount: ₹" + amount);
        System.out.println("Message: " + requester.getName() + " requested ₹" + amount);
    }
}