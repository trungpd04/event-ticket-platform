package com.trungpd.eventticketplatform.events.service;

import com.trungpd.eventticketplatform.common.exception.NotFoundException;
import com.trungpd.eventticketplatform.events.dto.request.CategoryRequest;
import com.trungpd.eventticketplatform.events.dto.response.CategoryResponse;
import com.trungpd.eventticketplatform.events.entity.Category;
import com.trungpd.eventticketplatform.events.mapper.CategoryMapper;
import com.trungpd.eventticketplatform.events.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "categories", key = "'active'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByIsActiveTrue().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Category findActiveById(Long id) {
        return categoryRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("error.category.not-found"));
    }

    @Transactional(readOnly = true)
    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("error.category.not-found"));
    }

    @CacheEvict(value = "categories", key = "'active'")
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @CacheEvict(value = "categories", key = "'active'")
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);
        categoryMapper.updateEntityFromRequest(request, category);
        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

}
