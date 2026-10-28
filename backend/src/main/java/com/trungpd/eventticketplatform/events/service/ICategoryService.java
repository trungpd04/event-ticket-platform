package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.events.dto.request.CategoryRequest;
import com.trungpd.eventticketplatform.events.dto.response.CategoryResponse;
import com.trungpd.eventticketplatform.events.entity.Category;

import java.util.List;

public interface ICategoryService {

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getActiveCategories();

    Category findActiveById(Long id);

    Category findById(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);
}
