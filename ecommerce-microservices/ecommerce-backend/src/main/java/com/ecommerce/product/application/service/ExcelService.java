package com.ecommerce.product.application.service;

import com.ecommerce.product.domain.Product;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface ExcelService {
    ByteArrayInputStream exportProductsToExcel();
    void importProductsFromExcel(MultipartFile file);
}
