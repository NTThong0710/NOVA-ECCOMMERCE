package com.ecommerce.product.application.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;

    public ImageUploadService(@Autowired(required = false) Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, String> uploadImage(MultipartFile file, String folder) throws IOException {
        if (cloudinary == null) {
            // Fake upload fallback
            System.out.println("Cloudinary not configured, returning fake URL.");
            return Map.of(
                "url", "https://via.placeholder.com/500?text=Fake+Image",
                "public_id", "fake_public_id_" + UUID.randomUUID()
            );
        }

        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto"
        ));

        return Map.of(
            "url", result.get("secure_url").toString(),
            "public_id", result.get("public_id").toString()
        );
    }

    public void deleteImage(String publicId) throws IOException {
        if (cloudinary == null || publicId.startsWith("fake_public_id_")) {
            System.out.println("Skipping delete for fake or unconfigured cloudinary: " + publicId);
            return;
        }

        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
