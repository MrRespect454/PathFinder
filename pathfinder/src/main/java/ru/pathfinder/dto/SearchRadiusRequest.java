package ru.pathfinder.dto;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class SearchRadiusRequest {
    @NotNull(message = "Широта обязательна")
    @Min(value = -90, message = "Широта должна быть между -90 и 90")
    @Max(value = 90, message = "Широта должна быть между -90 и 90")
    private Double lat;
    
    @NotNull(message = "Долгота обязательна")
    @Min(value = -180, message = "Долгота должна быть между -180 и 180")
    @Max(value = 180, message = "Долгота должна быть между -180 и 180")
    private Double lon;
    
    @NotNull(message = "Радиус обязателен")
    @Min(value = 10, message = "Минимальный радиус - 10 метров")
    @Max(value = 100000, message = "Максимальный радиус - 100 км")
    private Double radius = 1000.0;  // по умолчанию 1 км
    
    private Long categoryId;  // опциональная фильтрация по категории
}