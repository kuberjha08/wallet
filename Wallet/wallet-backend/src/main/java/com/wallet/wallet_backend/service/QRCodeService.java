package com.wallet.wallet_backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {
    
    public String generatePaymentQR(Long userId, String mobile, String name, Double amount) {
        try {
            // Create QR data structure
            Map<String, Object> qrData = new HashMap<>();
            qrData.put("userId", userId);
            qrData.put("mobile", mobile);
            qrData.put("name", name);
            qrData.put("type", "PAYMENT_REQUEST");
            if (amount != null) {
                qrData.put("amount", amount);
            }
            qrData.put("timestamp", System.currentTimeMillis());
            
            String qrContent = convertMapToJsonString(qrData);
            
            // Generate QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, 
                    BarcodeFormat.QR_CODE, 200, 200);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            return Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
    
    public String generateStaticQR(Long userId, String mobile, String name, String upiId) {
        try {
            // Create UPI payment string (standard format)
            String upiString;
            if (upiId != null && !upiId.isEmpty()) {
                upiString = String.format("upi://pay?pa=%s&pn=%s&tn=Wallet Payment&am=&cu=INR", 
                        upiId, name);
            } else {
                upiString = String.format("upi://pay?pa=%s@wallet&pn=%s&tn=Wallet Payment&am=&cu=INR", 
                        mobile, name);
            }
            
            // Generate QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(upiString, 
                    BarcodeFormat.QR_CODE, 250, 250);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            return Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
    
    private String convertMapToJsonString(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            json.append("\"").append(entry.getKey()).append("\":");
            if (entry.getValue() instanceof String) {
                json.append("\"").append(entry.getValue()).append("\"");
            } else {
                json.append(entry.getValue());
            }
            json.append(",");
        }
        json.deleteCharAt(json.length() - 1);
        json.append("}");
        return json.toString();
    }
}