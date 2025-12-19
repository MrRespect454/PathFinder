// ===== ОСНОВНОЙ ОБЪЕКТ ПРИЛОЖЕНИЯ =====
const mapApp = {
    // Константы
    NOVOSIBIRSK_CENTER: [54.9833, 82.8964],
    DEFAULT_ZOOM: 12,
    MAX_RADIUS: 1000,
    
    // Переменные состояния
    map: null,
    markers: null,
    currentLocationMarker: null,
    searchCircle: null,
    currentCategory: 'all',
    searchResults: [],
    userLocation: null,
    isGeolocationAvailable: true,
    mapInitialized: false,
    geolocationWatchId: null,
    
    // DOM элементы
    elements: {},
    
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    init: function() {
        console.log('Инициализация приложения карты...');
        
        // Сначала инициализируем DOM элементы
        this.initializeDOMElements();
        
        // Проверяем доступность геолокации
        this.checkGeolocationSupport();
        
        // Инициализируем карту сразу
        this.initializeMap();
        
        // Инициализация обработчиков событий
        this.initializeEventListeners();
        
        // Добавляем начальные точки
        this.addInitialPOIs();
        
        this.mapInitialized = true;
        console.log('Карта успешно инициализирована');
    },
    
    initializeMap: function() {
        try {
            // Проверяем, существует ли элемент карты
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.error('Элемент карты #map не найден');
                return;
            }
            
            // Устанавливаем явные размеры
            mapElement.style.height = '600px';
            mapElement.style.width = '100%';
            
            // Инициализируем карту
            this.map = L.map('map', {
                center: this.NOVOSIBIRSK_CENTER,
                zoom: this.DEFAULT_ZOOM,
                zoomControl: true,
                attributionControl: true
            });
            
            // Добавляем базовый слой карты (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(this.map);
            
            // Альтернативный слой на случай проблем с OpenStreetMap
            const backupLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                subdomains: 'abcd',
                maxZoom: 19
            });
            
            // Инициализация группы маркеров
            this.markers = L.layerGroup().addTo(this.map);
            
            // Добавляем элементы управления
            L.control.scale().addTo(this.map);
            
            // Добавляем кнопку для сброса местоположения
            this.addLocationControl();
            
            // Триггерим событие resize
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 500);
            
        } catch (error) {
            console.error('Критическая ошибка инициализации карты:', error);
            this.showMapError(error.message);
        }
    },
    
    showMapError: function(message) {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="map-error" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 20px;
                    text-align: center;
                    color: #718096;
                    background: #f8f9fa;
                    border-radius: 10px;
                ">
                    <h3 style="color: #e53e3e; margin-bottom: 10px;">Ошибка загрузки карты</h3>
                    <p style="margin-bottom: 15px;">${message}</p>
                    <button onclick="location.reload()" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 5px;
                    ">Обновить страницу</button>
                    <button onclick="mapApp.initializeMap()" style="
                        background: #48bb78;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 5px;
                    ">Повторить инициализацию</button>
                </div>
            `;
        }
    },
    
    addLocationControl: function() {
        // Создаем кастомную кнопку для геолокации
        const locationControl = L.control({ position: 'topleft' });
        
        locationControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = `
                <a href="#" title="Показать мое местоположение" style="
                    display: block;
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.4);
                ">📍</a>
            `;
            
            div.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                mapApp.getCurrentLocation();
                return false;
            };
            
            return div;
        };
        
        locationControl.addTo(this.map);
    },
    
    checkGeolocationSupport: function() {
        this.isGeolocationAvailable = !!navigator.geolocation;
        if (!this.isGeolocationAvailable) {
            console.warn('Геолокация не поддерживается браузером');
            if (this.elements.currentLocationBtn) {
                this.elements.currentLocationBtn.disabled = true;
                this.elements.currentLocationBtn.title = 'Геолокация не поддерживается вашим браузером';
                this.elements.currentLocationBtn.innerHTML = '📍 Недоступно';
            }
        }
    },
    
    initializeDOMElements: function() {
        console.log('Инициализация DOM элементов...');
        this.elements = {
            searchInput: document.getElementById('search-input'),
            radiusSlider: document.getElementById('radius-slider'),
            radiusValue: document.getElementById('radius-value'),
            searchBtn: document.getElementById('search-btn'),
            currentLocationBtn: document.getElementById('current-location-btn'),
            clearBtn: document.getElementById('clear-btn'),
            exportBtn: document.getElementById('export-btn'),
            resultCount: document.getElementById('result-count'),
            searchResultsDiv: document.getElementById('search-results'),
            loadingDiv: document.getElementById('loading')
        };
    },
    
    initializeEventListeners: function() {
        console.log('Инициализация обработчиков событий...');
        
        // Обновление значения радиуса
        if (this.elements.radiusSlider) {
            this.elements.radiusSlider.addEventListener('input', (e) => {
                const radius = e.target.value;
                if (this.elements.radiusValue) {
                    this.elements.radiusValue.textContent = radius + ' м';
                }
                this.updateMapZoomByRadius(radius);
            });
        }
        
        // Поиск по нажатию Enter
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        // Кнопка поиска
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        // Кнопка "Мое местоположение"
        if (this.elements.currentLocationBtn) {
            this.elements.currentLocationBtn.addEventListener('click', () => this.getCurrentLocation());
        }
        
        // Кнопка очистки
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.clearSearch());
        }
        
        // Кнопка экспорта
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportResults());
        }
        
        // Фильтры категорий
        document.querySelectorAll('.filterbtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filterbtn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.filterResultsByCategory();
            });
        });
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            if (this.map && this.mapInitialized) {
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 250);
            }
        });
    },
    
    // ===== ФУНКЦИИ ГЕОЛОКАЦИИ =====
    getCurrentLocation: function() {
        if (!this.isGeolocationAvailable) {
            this.showError('Геолокация не поддерживается вашим браузером');
            return;
        }
        
        this.showLoading(true);
        
        // Показываем сообщение о запросе
        this.showMessage('⌛ Запрашиваем доступ к вашему местоположению...');
        
        const options = {
            enableHighAccuracy: true,  // Использовать GPS если доступно
            timeout: 15000,           // 15 секунд таймаут
            maximumAge: 0             // Не использовать кэшированные данные
        };
        
        // Используем watchPosition для более надежного получения позиции
        if (this.geolocationWatchId) {
            navigator.geolocation.clearWatch(this.geolocationWatchId);
        }
        
        this.geolocationWatchId = navigator.geolocation.watchPosition(
            // Success callback
            (position) => {
                console.log('Геолокация успешна:', position);
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                this.userLocation = { lat, lng, accuracy };
                
                // Останавливаем наблюдение после получения позиции
                if (this.geolocationWatchId) {
                    navigator.geolocation.clearWatch(this.geolocationWatchId);
                    this.geolocationWatchId = null;
                }
                
                // Центрируем карту на местоположении
                this.centerMapOnLocation(lat, lng);
                
                // Добавляем маркер местоположения
                this.addUserLocationMarker(lat, lng, accuracy);
                
                // Показываем радиус поиска
                const radius = parseInt(this.elements.radiusSlider?.value || 1000);
                this.showSearchCircle(lat, lng, radius);
                
                // Выполняем поиск вокруг местоположения
                this.performSearchAroundLocation(lat, lng);
                
                this.showLoading(false);
                this.showMessage(`📍 Местоположение определено! Точность: ${Math.round(accuracy)} метров`);
            },
            // Error callback
            (error) => {
                console.error('Ошибка геолокации:', error);
                this.showLoading(false);
                
                let errorMessage = 'Не удалось определить местоположение. ';
                let detailedMessage = '';
                
                switch(error.code) {
                    case 1: // PERMISSION_DENIED
                        errorMessage += 'Доступ к геолокации запрещен.';
                        detailedMessage = `
                            <p>Чтобы разрешить доступ к геолокации в Firefox:</p>
                            <ol>
                                <li>Нажмите на значок замка слева от адресной строки</li>
                                <li>Выберите "Настройки доступа к сайту"</li>
                                <li>В разделе "Местоположение" выберите "Разрешить"</li>
                                <li>Обновите страницу и попробуйте снова</li>
                            </ol>
                            <p>Или вы можете использовать координаты Новосибирска для демо.</p>
                        `;
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMessage += 'Информация о местоположении недоступна.';
                        detailedMessage = '<p>Проверьте, включена ли GPS на устройстве.</p>';
                        break;
                    case 3: // TIMEOUT
                        errorMessage += 'Превышено время ожидания.';
                        detailedMessage = '<p>Проверьте подключение к интернету.</p>';
                        break;
                    default:
                        errorMessage += 'Неизвестная ошибка.';
                }
                
                this.showError(errorMessage, detailedMessage);
                
                // Предлагаем использовать Новосибирск как демо
                this.offerDemoLocation();
            },
            options
        );
        
        // Таймаут на случай если watchPosition не сработает
        setTimeout(() => {
            if (this.geolocationWatchId) {
                navigator.geolocation.clearWatch(this.geolocationWatchId);
                this.geolocationWatchId = null;
                
                if (!this.userLocation) {
                    this.showLoading(false);
                    this.showError('Время ожидания истекло. Попробуйте снова.');
                    this.offerDemoLocation();
                }
            }
        }, 20000);
    },
    
    centerMapOnLocation: function(lat, lng) {
        if (!this.map) return;
        
        // Рассчитываем зум на основе точности
        let zoomLevel = 15; // По умолчанию
        
        if (this.userLocation && this.userLocation.accuracy) {
            if (this.userLocation.accuracy > 1000) zoomLevel = 12;
            else if (this.userLocation.accuracy > 500) zoomLevel = 13;
            else if (this.userLocation.accuracy > 100) zoomLevel = 14;
            else zoomLevel = 15;
        }
        
        this.map.setView([lat, lng], zoomLevel, {
            animate: true,
            duration: 1
        });
    },
    
    addUserLocationMarker: function(lat, lng, accuracy) {
        // Удаляем старый маркер если есть
        if (this.currentLocationMarker) {
            this.map.removeLayer(this.currentLocationMarker);
        }
        
        // Создаем иконку для маркера местоположения
        const locationIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
                <div style="
                    position: relative;
                    width: 40px;
                    height: 40px;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 20px;
                        height: 20px;
                        background: #667eea;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
                        z-index: 2;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 40px;
                        height: 40px;
                        background: rgba(102, 126, 234, 0.3);
                        border-radius: 50%;
                        animation: pulse 2s infinite;
                        z-index: 1;
                    "></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        // Создаем круг точности
        if (accuracy) {
            L.circle([lat, lng], {
                color: '#667eea',
                fillColor: '#667eea',
                fillOpacity: 0.1,
                weight: 1,
                radius: accuracy
            }).addTo(this.map);
        }
        
        // Добавляем маркер
        this.currentLocationMarker = L.marker([lat, lng], { 
            icon: locationIcon,
            zIndexOffset: 1000
        })
        .addTo(this.map)
        .bindPopup(`
            <div style="min-width: 200px;">
                <h4 style="margin: 0 0 10px 0;">📍 Ваше местоположение</h4>
                <p style="margin: 0 0 5px 0;">Широта: ${lat.toFixed(6)}</p>
                <p style="margin: 0 0 5px 0;">Долгота: ${lng.toFixed(6)}</p>
                ${accuracy ? `<p style="margin: 0;">Точность: ${Math.round(accuracy)} м</p>` : ''}
            </div>
        `)
        .openPopup();
        
        // Добавляем анимацию пульсации
        this.addPulseAnimation();
    },
    
    addPulseAnimation: function() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.7;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    showSearchCircle: function(lat, lng, radius) {
        // Удаляем старый круг если есть
        if (this.searchCircle) {
            this.map.removeLayer(this.searchCircle);
        }
        
        // Создаем новый круг поиска
        this.searchCircle = L.circle([lat, lng], {
            color: '#48bb78',
            fillColor: '#48bb78',
            fillOpacity: 0.1,
            weight: 2,
            radius: radius
        }).addTo(this.map);
        
        // Добавляем подпись радиуса
        if (this.searchCircleLabel) {
            this.map.removeLayer(this.searchCircleLabel);
        }
        
        this.searchCircleLabel = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'radius-label',
                html: `<div style="
                    background: rgba(255,255,255,0.9);
                    padding: 2px 8px;
                    border-radius: 10px;
                    border: 1px solid #48bb78;
                    font-size: 12px;
                    color: #2d3748;
                    font-weight: bold;
                ">Радиус: ${radius} м</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, 10]
            })
        }).addTo(this.map);
    },
    
    // ===== ФУНКЦИИ ДЛЯ КАРТЫ =====
    updateMapZoomByRadius: function(radiusValue = null) {
        if (!this.map) return;
        
        const radius = radiusValue || parseInt(this.elements.radiusSlider?.value || 1000);
        
        // Рассчитываем зум на основе радиуса
        // Чем больше радиус, тем меньше зум (более отдаленный вид)
        let zoomLevel;
        
        if (radius <= 200) {
            zoomLevel = 16; // Очень близко
        } else if (radius <= 500) {
            zoomLevel = 15; // Близко
        } else if (radius <= 1000) {
            zoomLevel = 14; // Средне
        } else if (radius <= 2000) {
            zoomLevel = 13; // Далеко
        } else {
            zoomLevel = 12; // Очень далеко
        }
        
        // Если есть локация пользователя, центрируем на ней с новым зумом
        if (this.userLocation) {
            this.map.setView([this.userLocation.lat, this.userLocation.lng], zoomLevel, {
                animate: true,
                duration: 0.5
            });
            
            // Обновляем круг поиска если он есть
            if (this.searchCircle) {
                this.searchCircle.setRadius(radius);
                
                // Обновляем подпись
                if (this.searchCircleLabel) {
                    this.searchCircleLabel.setIcon(L.divIcon({
                        className: 'radius-label',
                        html: `<div style="
                            background: rgba(255,255,255,0.9);
                            padding: 2px 8px;
                            border-radius: 10px;
                            border: 1px solid #48bb78;
                            font-size: 12px;
                            color: #2d3748;
                            font-weight: bold;
                        ">Радиус: ${radius} м</div>`,
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                    }));
                }
            }
        }
        
        // Сохраняем текущий радиус в заголовке
        if (this.elements.radiusValue) {
            this.elements.radiusValue.textContent = radius + ' м';
        }
    },
    
    // ===== УТИЛИТЫ СООБЩЕНИЙ =====
    showMessage: function(message) {
        if (!this.elements.searchResultsDiv) return;
        
        this.elements.searchResultsDiv.innerHTML = `
            <div class="result-item message">
                <p>${message}</p>
            </div>
        `;
    },
    
    showError: function(message, details = '') {
        if (!this.elements.searchResultsDiv) return;
        
        this.elements.searchResultsDiv.innerHTML = `
            <div class="result-item error">
                <h4 style="color: #e53e3e; margin-bottom: 10px;">❌ Ошибка</h4>
                <p>${message}</p>
                ${details ? `<div style="margin-top: 10px; padding: 10px; background: #fff5f5; border-radius: 5px;">${details}</div>` : ''}
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="mapApp.getCurrentLocation()" class="show-on-map" style="flex: 1;">
                        Попробовать снова
                    </button>
                    <button onclick="mapApp.useNovosibirskDemo()" class="show-on-map" style="flex: 1; background: #48bb78;">
                        Использовать Новосибирск
                    </button>
                </div>
            </div>
        `;
    },
    
    offerDemoLocation: function() {
        if (!this.elements.searchResultsDiv) return;
        
        this.elements.searchResultsDiv.innerHTML += `
            <div class="result-item info" style="margin-top: 10px;">
                <p>Хотите использовать Новосибирск для демонстрации?</p>
                <button onclick="mapApp.useNovosibirskDemo()" class="show-on-map" style="width: 100%; margin-top: 10px;">
                    📍 Использовать координаты Новосибирска
                </button>
            </div>
        `;
    },
    
    useNovosibirskDemo: function() {
        this.userLocation = {
            lat: this.NOVOSIBIRSK_CENTER[0],
            lng: this.NOVOSIBIRSK_CENTER[1],
            accuracy: 100
        };
        
        this.centerMapOnLocation(this.userLocation.lat, this.userLocation.lng);
        this.addUserLocationMarker(this.userLocation.lat, this.userLocation.lng, 100);
        
        const radius = parseInt(this.elements.radiusSlider?.value || 1000);
        this.showSearchCircle(this.userLocation.lat, this.userLocation.lng, radius);
        
        this.performSearchAroundLocation(this.userLocation.lat, this.userLocation.lng);
        
        this.showMessage('📍 Используются демо-координаты Новосибирска');
    },
    
    // ===== ОСТАЛЬНЫЕ ФУНКЦИИ (остаются без изменений) =====
    // [Остальной код остается таким же, как в предыдущей версии]
    // Функции:   ,
    // , , , ,
    // , , generateDemoPOIsAround,
    // displaySearchResults, updateResultsDisplay]], filterResultsByCategory,
    // showLoading, clearSearch, exportResults, addInitialPOIs,
    // showNotifications, showSettings
    
    // [Вставьте сюда остальные функции из предыдущей версии без изменений]
    addMarkersToMap: function(pois) {
        if (!this.map || !this.markers) return;
        
        this.markers.clearLayers();
        
        pois.forEach(poi => {
            const icon = this.createMarkerIcon(poi.category);
            const marker = L.marker([poi.lat, poi.lng], { icon })
                .addTo(this.markers)
                .bindPopup(this.createPopupContent(poi))
                .on('click', function() {
                    this.openPopup();
                });
            
            marker.poiData = poi;
        });
        
        // Подгоняем карту к маркерам
        if (pois.length > 0) {
            const bounds = this.markers.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds, { 
                    padding: [50, 50],
                    maxZoom: 15
                });
            }
        }
    },
    createMarkerIcon: function(category, highlight = false) {
        const size = highlight ? 40 : 30;
        const color = highlight ? '#ff6b6b' : '#667eea';
        
        const icons = {
            restaurant: '🍽️',
            cafe: '☕',
            park: '🌳',
            museum: '🏛️',
            shop: '🛒'
        };
        
        const icon = icons[category] || '📍';
        
        return L.divIcon({
            className: highlight ? 'highlighted-marker' : 'custom-marker',
            html: `<div style="
                background: ${color};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: ${highlight ? '20px' : '16px'};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${icon}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size]
        });
    },
    createPopupContent: function(poi) {
        const categoryIcon = this.getCategoryIcon(poi.category);
        return `
            <div style="min-width: 200px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; color: #2d3748;">${poi.name}</h3>
                <p style="margin: 0 0 12px 0; color: #718096; font-size: 14px;">${poi.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <span style="color: #667eea; font-weight: 500;">${categoryIcon} ${poi.category}</span>
                    <span style="color: #d69e2e; font-weight: 600;">⭐ ${poi.rating || 4.5}</span>
                </div>
            </div>
        `;
    },
    getCategoryIcon: function(category) {
        const icons = {
            restaurant: '🍽️',
            cafe: '☕',
            park: '🌳',
            museum: '🏛️',
            shop: '🛒'
        };
        return icons[category] || '📍';
    },
    centerMapOnPOI: function(lat, lng) {
        if (!this.map) return;
        
        this.map.setView([lat, lng], 16);
        
        this.markers.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.poiData) {
                if (Math.abs(layer.poiData.lat - lat) < 0.0001 && 
                    Math.abs(layer.poiData.lng - lng) < 0.0001) {
                    layer.openPopup();
                }
            }
        });
    },
    highlightMarker: function(poi) {
        this.markers.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.poiData && layer.poiData.id === poi.id) {
                layer.setIcon(this.createMarkerIcon(poi.category, true));
                
                setTimeout(() => {
                    layer.setIcon(this.createMarkerIcon(poi.category, false));
                }, 2000);
            }
        });
    },
    performSearch: function() {
        const query = this.elements.searchInput?.value.trim() || '';
        if (!query && !this.userLocation) {
            alert('Введите поисковый запрос или используйте кнопку "Мое местоположение"');
            return;
        }
        
        this.showLoading(true);
        
        if (query) {
            this.searchByText(query);
        } else if (this.userLocation) {
            this.performSearchAroundLocation(this.userLocation.lat, this.userLocation.lng);
        }
    },
    searchByText: function(query) {
        // Демо данные
        const demoPOIs = [
            { id: 1, name: 'Новосибирский театр оперы и балета', lat: 54.9961, lng: 82.8963, category: 'museum', 
              description: 'Крупнейший театр России', rating: 4.8 },
            { id: 2, name: 'Парк «Берёзовая роща»', lat: 54.9876, lng: 82.9123, category: 'park', 
              description: 'Живописный парк в центре города', rating: 4.5 }
        ];
        
        const filtered = demoPOIs.filter(poi => 
            poi.name.toLowerCase().includes(query.toLowerCase()) ||
            (poi.description && poi.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        setTimeout(() => {
            this.displaySearchResults(filtered);
            this.addMarkersToMap(filtered);
            this.showLoading(false);
        }, 300);
    },
    performSearchAroundLocation: function(lat, lng) {
        const radius = parseInt(this.elements.radiusSlider?.value || 1000);
        const demoPOIs = this.generateDemoPOIsAround(lat, lng, radius);
        
        setTimeout(() => {
            this.displaySearchResults(demoPOIs);
            this.addMarkersToMap(demoPOIs);
            this.showLoading(false);
        }, 300);
    },
    generateDemoPOIsAround: function(lat, lng, radius) {
        const radiusInDegrees = radius / 111320;
        
        return [
            { 
                id: 11, 
                name: 'Ближайший ресторан', 
                lat: lat + (radiusInDegrees * 0.3), 
                lng: lng + (radiusInDegrees * 0.3), 
                category: 'restaurant', 
                description: 'Ресторан поблизости', 
                rating: 4.2 
            },
            { 
                id: 12, 
                name: 'Кафе рядом', 
                lat: lat - (radiusInDegrees * 0.2), 
                lng: lng, 
                category: 'cafe', 
                description: 'Уютное кафе', 
                rating: 4.3 
            }
        ];
    },
    
    displaySearchResults: function(results) {
        this.searchResults = results;
        this.updateResultsDisplay();
    },
    
    updateResultsDisplay: function() {
        if (!this.elements.searchResultsDiv) return;
        
        const filteredResults = this.filterResultsByCategory();
        
        if (filteredResults.length === 0) {
            this.elements.searchResultsDiv.innerHTML = `
                <div class="result-item no-results">
                    <p>Ничего не найдено. Попробуйте изменить поисковый запрос или категорию.</p>
                </div>
            `;
            if (this.elements.resultCount) {
                this.elements.resultCount.textContent = '0';
            }
            return;
        }
        
        let html = '';
        filteredResults.forEach(poi => {
            const categoryIcon = this.getCategoryIcon(poi.category);
            html += `
                <div class="result-item" data-id="${poi.id}">
                    <h4>${poi.name}</h4>
                    <p>${poi.description}</p>
                    <div class="result-meta">
                        <span class="category-badge">
                            <span class="category-icon">${categoryIcon}</span>
                            ${poi.category}
                        </span>
                        <span class="rating">⭐ ${poi.rating || 4.5}</span>
                    </div>
                    <button class="show-on-map" onclick="mapApp.centerMapOnPOI(${poi.lat}, ${poi.lng}); mapApp.highlightMarker(${JSON.stringify(poi).replace(/"/g, '&quot;')})">
                        Показать на карте
                    </button>
                </div>
            `;
        });
        
        this.elements.searchResultsDiv.innerHTML = html;
        if (this.elements.resultCount) {
            this.elements.resultCount.textContent = filteredResults.length.toString();
        }
    },
    filterResultsByCategory: function() {
        if (this.currentCategory === 'all') {
            return this.searchResults;
        }
        return this.searchResults.filter(poi => poi.category === this.currentCategory);
    },
    
    // ===== УТИЛИТЫ =====
    showLoading: function(show) {
        if (!this.elements.loadingDiv) return;
        
        if (show) {
            this.elements.loadingDiv.classList.add('active');
        } else {
            this.elements.loadingDiv.classList.remove('active');
        }
    },
    
    clearSearch: function() {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        if (this.markers) {
            this.markers.clearLayers();
        }
        
        if (this.searchCircle) {
            this.map.removeLayer(this.searchCircle);
            this.searchCircle = null;
        }
        
        if (this.currentLocationMarker) {
            this.map.removeLayer(this.currentLocationMarker);
            this.currentLocationMarker = null;
        }
        
        this.searchResults = [];
        this.updateResultsDisplay();
        
        if (this.map) {
            this.map.setView(this.NOVOSIBIRSK_CENTER, this.DEFAULT_ZOOM);
        }
    },
    
    exportResults: function() {
        if (this.searchResults.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }
        
        const dataStr = JSON.stringify(this.searchResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pathfinder_search_results.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    addInitialPOIs: function() {
        const initialPOIs = [
            { id: 1, name: 'Новосибирский театр оперы и балета', lat: 55.03, lng: 82.92, category: 'museum', 
              description: 'Крупнейший театр России', rating: 4.8 },
            { id: 2, name: 'Парк «Берёзовая роща»', lat: 55.0466, lng: 82.9519, category: 'park', 
              description: 'Живописный парк в центре города', rating: 4.5 }
        ];
        
        this.addMarkersToMap(initialPOIs);
        this.displaySearchResults(initialPOIs);
    },
    showNotifications: function() {
        alert('Уведомления\nВ этом разделе будут отображаться ваши уведомления и сообщения.');
    },
    
    showSettings: function() {
        alert('Настройки\nЗдесь можно будет настроить параметры карты, уведомления и профиль.');
    }
    
};

// Инициализация при полной загрузке страницы
window.addEventListener('load', () => {
    console.log('Страница полностью загружена, инициализируем карту...');
    mapApp.init();
});

