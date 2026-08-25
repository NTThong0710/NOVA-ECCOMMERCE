package com.ecommerce.product.application.service.impl;

import com.ecommerce.product.application.service.ExcelService;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductStatus;
import com.ecommerce.product.infrastructure.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelServiceImpl implements ExcelService {

    private final ProductRepository productRepository;

    public ExcelServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ByteArrayInputStream exportProductsToExcel() {
        String[] columns = {"ID", "Title", "SKU", "Price", "Stock Quantity", "Category", "Brand", "Status"};
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            // Header
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            // Data
            List<Product> products = productRepository.findAll();
            int rowIdx = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(product.getId() != null ? product.getId() : 0);
                row.createCell(1).setCellValue(product.getTitle() != null ? product.getTitle() : "");
                row.createCell(2).setCellValue(product.getSku() != null ? product.getSku() : "");
                row.createCell(3).setCellValue(product.getPrice() != null ? product.getPrice() : 0.0);
                row.createCell(4).setCellValue(product.getStockQuantity() != null ? product.getStockQuantity() : 0);
                row.createCell(5).setCellValue(product.getCategory() != null ? product.getCategory() : "");
                row.createCell(6).setCellValue(product.getBrand() != null ? product.getBrand() : "");
                row.createCell(7).setCellValue(product.getStatus() != null ? product.getStatus().name() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to export data to Excel file: " + e.getMessage());
        }
    }

    @Override
    public void importProductsFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            
            List<Product> products = new ArrayList<>();
            int rowNumber = 0;
            
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                // Skip header
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }
                
                Iterator<Cell> cellsInRow = currentRow.iterator();
                Product product = new Product();
                int cellIdx = 0;
                
                while (cellsInRow.hasNext()) {
                    Cell currentCell = cellsInRow.next();
                    switch (cellIdx) {
                        case 1:
                            product.setTitle(currentCell.getStringCellValue());
                            break;
                        case 2:
                            product.setSku(currentCell.getStringCellValue());
                            break;
                        case 3:
                            product.setPrice(currentCell.getNumericCellValue());
                            break;
                        case 4:
                            product.setStockQuantity((int) currentCell.getNumericCellValue());
                            break;
                        case 5:
                            product.setCategory(currentCell.getStringCellValue());
                            break;
                        case 6:
                            product.setBrand(currentCell.getStringCellValue());
                            break;
                        default:
                            break;
                    }
                    cellIdx++;
                }
                
                product.setStatus(ProductStatus.ACTIVE);
                product.setCreatedAt(LocalDateTime.now());
                product.setUpdatedAt(LocalDateTime.now());
                
                if (product.getTitle() != null) {
                    String generatedSlug = product.getTitle().toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
                    product.setSlug(generatedSlug + "-" + System.currentTimeMillis());
                }
                
                products.add(product);
            }
            
            productRepository.saveAll(products);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store Excel data: " + e.getMessage());
        }
    }
}
