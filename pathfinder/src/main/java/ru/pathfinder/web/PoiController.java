package ru.pathfinder.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import ru.pathfinder.domain.Interestingtag;
import ru.pathfinder.dto.PoiResponseDto;
import ru.pathfinder.dto.SearchRadiusRequest;
import ru.pathfinder.repository.PoiRepository;
import ru.pathfinder.service.InterestingtagService;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/poi")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Для разработки, в продакшене указать конкретные домены
public class PoiController {
    
    private final PoiRepository poiRepository;
    private final InterestingtagService interestingtagService;
    
    /**
     * Поиск POI в радиусе
     */
    @PostMapping("/search/radius")
    public ResponseEntity<?> searchByRadius(@Valid @RequestBody SearchRadiusRequest request) {
        try {
            log.info("Поиск POI в радиусе: lat={}, lon={}, radius={}м, categoryId={}", 
                    request.getLat(), request.getLon(), request.getRadius(), request.getCategoryId());
            
            List<Interestingtag> pois;
            
            if (request.getCategoryId() != null) {
                // Поиск с фильтрацией по категории
                pois = poiRepository.findWithinRadiusByCategory(
                    request.getLat(),
                    request.getLon(),
                    request.getRadius(),
                    request.getCategoryId()
                );
            } else {
                // Поиск всех POI в радиусе
                pois = poiRepository.findWithinRadius(
                    request.getLat(),
                    request.getLon(),
                    request.getRadius()
                );
            }
            
            // Конвертируем в DTO
            List<PoiResponseDto> result = pois.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            log.info("Найдено {} POI в радиусе {} метров", result.size(), request.getRadius());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Ошибка при поиске POI по радиусу", e);
            return ResponseEntity.internalServerError()
                .body("Ошибка при поиске: " + e.getMessage());
        }
    }
    
    /**
     * Поиск POI по названию в радиусе
     */
    @PostMapping("/search/name")
    public ResponseEntity<?> searchByNameInRadius(@Valid @RequestBody SearchRadiusRequest request,
                                                  @RequestParam(required = false) String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return searchByRadius(request);
            }
            
            log.info("Поиск POI по названию '{}' в радиусе", query);
            
            List<Interestingtag> pois = poiRepository.findWithinRadiusByName(
                request.getLat(),
                request.getLon(),
                request.getRadius(),
                query.trim()
            );
            
            List<PoiResponseDto> result = pois.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Ошибка при поиске POI по названию", e);
            return ResponseEntity.internalServerError()
                .body("Ошибка при поиске: " + e.getMessage());
        }
    }
    
    /**
     * Получение POI по категории
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getByCategory(@PathVariable Long categoryId) {
        try {
            List<Interestingtag> pois = poiRepository.findByCategoryId(categoryId);
            List<PoiResponseDto> result = pois.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Ошибка при получении POI по категории", e);
            return ResponseEntity.internalServerError()
                .body("Ошибка: " + e.getMessage());
        }
    }
    
    /**
     * Получение всех одобренных POI
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllApproved() {
        try {
            List<Interestingtag> pois = poiRepository.findByIsApprovedTrue();
            List<PoiResponseDto> result = pois.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Ошибка при получении всех POI", e);
            return ResponseEntity.internalServerError()
                .body("Ошибка: " + e.getMessage());
        }
    }
    
    /**
     * Конвертация сущности в DTO
     */
    private PoiResponseDto convertToDto(Interestingtag poi) {
        PoiResponseDto dto = new PoiResponseDto();
        dto.setId(poi.getId());
        dto.setName(poi.getName());
        dto.setDescription(poi.getDescription());
        dto.setAddress(poi.getAddress());
        dto.setAverageRating(poi.getAverageRating());
        dto.setCoordinates(poi.getCoordinates());
        
        if (poi.getCategory() != null) {
            PoiResponseDto.CategoryDto categoryDto = new PoiResponseDto.CategoryDto();
            categoryDto.setId(poi.getCategory().getId());
            categoryDto.setName(poi.getCategory().getName());
            categoryDto.setIconUrl(poi.getCategory().getIconUrl());
            dto.setCategory(categoryDto);
        }
        
        if (poi.getCreatedBy() != null) {
            PoiResponseDto.UserDto userDto = new PoiResponseDto.UserDto();
            userDto.setId(poi.getCreatedBy().getId());
            userDto.setUsername(poi.getCreatedBy().getUsername());
            dto.setCreatedBy(userDto);
        }
        
        return dto;
    }
}
