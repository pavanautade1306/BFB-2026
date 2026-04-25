/**
 * CropSmart Recommendation Engine
 */

const RecommenderEngine = {
    /**
     * Scores a crop based on user inputs
     * Returns a score from 0-100
     */
    score(crop, inputs) {
        let score = 0;

        // 1. Season match (+25)
        if (crop.suitableSeasons.includes(inputs.season)) {
            score += 25;
        }

        // 2. Soil type match (+20)
        if (crop.suitableSoils.includes(inputs.soilType)) {
            score += 20;
        }

        // 3. pH range match (+10)
        const [minPh, maxPh] = crop.phRange;
        if (inputs.ph >= minPh && inputs.ph <= maxPh) {
            score += 10;
        } else if (inputs.ph >= minPh - 0.5 && inputs.ph <= maxPh + 0.5) {
            score += 5; // Partial credit
        }

        // 4. Temperature match (+10)
        const [minTemp, maxTemp] = crop.tempRange;
        if (inputs.temperature >= minTemp && inputs.temperature <= maxTemp) {
            score += 10;
        }

        // 5. Rainfall match (+10)
        const [minRain, maxRain] = crop.rainfallRange;
        if (inputs.rainfall >= minRain && inputs.rainfall <= maxRain) {
            score += 10;
        }

        // 6. Irrigation match (+5)
        if (crop.irrigation.includes(inputs.irrigation)) {
            score += 5;
        }

        // 7. NPK match (+5)
        // Nutrient mapping: Low/Medium/High
        if (crop.nitrogen.includes(inputs.nitrogen)) score += 1.6;
        if (crop.phosphorus.includes(inputs.phosphorus)) score += 1.7;
        if (crop.potassium.includes(inputs.potassium)) score += 1.7;

        // 8. Budget compatibility (+5)
        if (crop.budget.includes(inputs.budget)) {
            score += 5;
        }

        // 9. State suitability (+5)
        if (crop.states.includes(inputs.state)) {
            score += 5;
        }

        // 10. Crop type preference (+5)
        if (inputs.preferredTypes.length === 0 || inputs.preferredTypes.includes(crop.cropType)) {
            score += 5;
        }

        return Math.min(Math.round(score), 100);
    },

    /**
     * Recommends top 5 crops
     */
    recommend(inputs) {
        const results = cropDatabase.map(crop => {
            const matchScore = this.score(crop, inputs);
            return { ...crop, matchScore };
        });

        // Sort by score descending
        results.sort((a, b) => b.matchScore - a.matchScore);

        return results.slice(0, 5);
    },

    /**
     * Renders crop results to a container
     */
    renderResults(crops, container, farmArea) {
        container.innerHTML = '';
        
        crops.forEach((crop, index) => {
            const card = document.createElement('div');
            card.className = 'card crop-card';
            card.style.animationDelay = (index * 100) + 'ms';

            const scoreColor = crop.matchScore > 75 ? 'var(--success)' : 
                             (crop.matchScore > 40 ? 'var(--warning)' : 'var(--danger)');

            const totalRevenue = (crop.avgRevenue * farmArea).toLocaleString();

            card.innerHTML = `
                <div class="rank-badge">#${index + 1}</div>
                ${index === 0 ? '<div class="best-match-ribbon">Best Match</div>' : ''}
                
                <div class="crop-card-header">
                    <span class="crop-card-emoji">${crop.image_emoji}</span>
                    <h3>${crop.name}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${crop.localName} • ${crop.cropType}</p>
                </div>

                <div style="text-align: center; margin-top: 16px;">
                    <div class="match-score-pill" style="background: ${scoreColor}15; color: ${scoreColor}">
                        Match Score: ${crop.matchScore}%
                    </div>
                </div>

                <div class="crop-card-details">
                    <div class="detail-item">
                        <strong>📅 Season</strong>
                        ${crop.suitableSeasons.join(', ')}
                    </div>
                    <div class="detail-item">
                        <strong>⏱ Duration</strong>
                        ${crop.growthDuration}
                    </div>
                    <div class="detail-item">
                        <strong>💧 Water</strong>
                        ${crop.waterRequirement}
                    </div>
                    <div class="detail-item">
                        <strong>⚠ Risk</strong>
                        ${crop.riskLevel}
                    </div>
                    <div class="detail-item">
                        <strong>📈 Avg Yield</strong>
                        ${crop.avgYield}
                    </div>
                    <div class="detail-item">
                        <strong>💰 Est. Revenue</strong>
                        ₹${totalRevenue}
                    </div>
                </div>

                <div style="margin-top: 12px;">
                    <label style="margin-bottom: 4px;">✅ Pros</label>
                    <div class="chip-group">
                        ${crop.pros.map(p => `<span class="chip chip-success">${p}</span>`).join('')}
                    </div>
                </div>

                <div style="margin-top: 12px;">
                    <label style="margin-bottom: 4px;">⚠️ Cons</label>
                    <div class="chip-group">
                        ${crop.cons.map(c => `<span class="chip chip-danger">${c}</span>`).join('')}
                    </div>
                </div>

                <div style="margin-top: 16px; font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">
                    <strong>💡 Pro Tip:</strong> ${crop.tips}
                </div>

                <div style="margin-top: 24px; display: flex; gap: 12px;">
                    <button class="btn btn-outline" style="flex: 1;" onclick="viewCropDetails('${crop.name}')">Details</button>
                    <button class="btn btn-primary" style="flex: 1.5;" onclick="saveCrop('${crop.name}')">Save to Farm</button>
                </div>
            `;
            
            container.appendChild(card);
        });
    }
};
