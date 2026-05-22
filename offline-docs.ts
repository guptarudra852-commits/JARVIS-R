export interface OfflineDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  createdAt: string;
}

export const INITIAL_OFFLINE_DOCS: OfflineDoc[] = [
  {
    id: "doc_finance",
    title: "What Is Finance?",
    category: "Finance",
    summary: "A comprehensive overview of finance addressing the management, creation, and study of money, investments, and public, corporate, and personal finance.",
    createdAt: "2026-05-22T09:47:52Z",
    content: `## What Is Finance?
Finance is a term that addresses matters regarding the management, creation, and study of money and investments. It involves the use of credit and debt, securities, and investment to finance current projects using future income flows. Finance is closely linked to the time value of money, interest rates, and other related topics because of this temporal aspect.

Finance can be broadly divided into three categories:
* Public finance
* Corporate finance
* Personal finance

Other specific categories include behavioral finance, which seeks to identify the cognitive, emotional, social, and psychological reasons behind financial decisions.

### Key Takeaways
* **Finance** is a term that broadly describes the study and system of money, investments, and other financial instruments.
* Finance can be broadly divided into three categories: public finance, corporate finance, and personal finance.
* Subcategories of finance include social finance and behavioral finance.
* The history of finance and financial activities dates back to the dawn of civilization.
* Finance has roots in scientific fields such as statistics, economics, and mathematics but it also includes nonscientific elements that liken it to an art.

### Understanding Finance
Finance is typically broken down into three broad categories: public finance, corporate finance, and personal finance.

* **Public finance** includes tax systems, government expenditures, budget procedures, stabilization policies and instruments, debt issues, and other government concerns. 
* **Corporate finance** involves managing assets, liabilities, revenues, and debts for businesses. 
* **Personal finance** defines all financial decisions and activities of an individual or household, including budgeting, insurance, mortgage planning, savings, and retirement planning.

### Key Finance Terms
* **Asset:** An asset is something of value such as cash, real estate, or property. A business may have current assets or fixed assets.
* **Balance sheet:** A balance sheet is a document that shows a company’s assets and liabilities. Subtract the liabilities from the assets to find the firm’s net worth.
* **Cash flow:** Cash flow is the movement of money into and out of a business or household.
* **Compound interest:** Compound interest is calculated and added periodically, unlike simple interest which is interest added to the principal one time. This results in interest being charged not only on the principal but also on the interest that's already accrued.
* **Equity:** Equity means ownership. Stocks are called equities because each share represents a portion of ownership in the underlying corporation or entity.
* **Liability:** A liability is a financial obligation such as debt. Liabilities can be current or long-term.
* **Liquidity:** Liquidity refers to how easily an asset can be converted to cash. Real estate isn't a very liquid investment because it can take weeks, months, or even longer to sell.
* **Profit:** Profit is the money that's left over after expenses. A profit and loss statement shows how much a business has earned or lost for a particular period.

### History of Finance
Finance arose as a study of theory and practice distinct from the field of economics in the 1940s and 1950s. It began with the works of Harry Markowitz, William F. Sharpe, Fischer Black, and Myron Scholes.

Particular realms of finance such as banking, lending, and investing have been around in some form since the dawn of civilization. The financial transactions of the early Sumerians were formalized in the Babylonian Code of Hammurabi around 1800 BCE. This set of rules regulated ownership or rental of land, employment of agricultural labor, and credit.

Rates varied depending on whether you were borrowing grain or silver. Cowrie shells were used as a form of money in China by 1200 BCE. Coined money was introduced in the first millennium BCE. King Croesus of Lydia, which is now Turkey, was one of the first to strike and circulate gold coins around 564 BCE. Hence the expression “rich as Croesus.”

Temples also loaned money, acting as financial centers of major cities in ancient Rome due to safety considerations.

#### Early Stocks, Bonds, and Options
* Belgium claims to be home to the first exchange with one in Antwerp dating back to 1531.
* East India Co. became the first publicly traded company in the 1600s as it issued stock and paid dividends on proceeds from its voyages.
* The London Stock Exchange was created in 1773 and was followed by the New York Stock Exchange less than 20 years later.
* The earliest recorded bond dates back to 2400 BCE. It was a stone tablet that recorded debt obligations.
* Governments began issuing debts to fund war efforts during the Middle Ages. The Bank of England was created to finance the British Navy in the 1600s.
* The United States began issuing Treasury bonds to support the Revolutionary War nearly a century later.

#### Advances in Accounting
One of the earliest and most important sources is the arithmetical manuscript written by Leonardo Fibonacci of Pisa, known as “Liber Abaci,” in 1201. It gives examples comparing compound and simple interest.

Luca Pacioli’s “Summa de arithmetica, geometria, proportioni et proportionalita” was the first comprehensive treatise on bookkeeping and accountancy. It was published in Venice in 1494.

* **Compound Interest Formula:**
  $$\Lambda = P(1 + r/n)^{nt}$$
  Where:
  * **A** = final amount
  * **P** = initial principal balance
  * **r** = interest rate
  * **n** = number of times interest applied per time period
  * **t** = number of time periods elapsed

### Tenets of Behavioral Finance
Behavioral finance proposes psychology-based theories to explain financial anomalies such as severe rises or falls in stock prices. Four tenets are key:
1. **Mental accounting:** refers to the propensity for people to allocate money for specific purposes based on miscellaneous subjective criteria.
2. **Herd behavior:** states that people tend to mimic the financial behaviors of the majority whether they're rational or irrational.
3. **Anchoring:** refers to attaching spending to a certain reference point or level even though it may have no logical relevance.
4. **High self-rating:** refers to a person’s tendency to rank themself better than others or higher than average, often resulting in overconfidence.

### Finance vs. Economics
* **Economics** (specifically macroeconomics) tends to be bigger picture in nature: how a country, region, or market performs or general public policy.
* **Microeconomics** explains what to expect if certain conditions change on the industry, firm, or individual level.
* **Finance** focuses on how companies and investors evaluate risk and return. It has historically been more practical, whereas economics has been more theoretical.

### Is Finance an Art or a Science?
* **Finance as a Science:** It has strong roots in related scientific areas such as statistics and mathematics. Technical formulas (like Black-Scholes and CAPM) attempt to explain market behavior in an emotionless manner.
* **Finance as an Art:** History is rife with stock disasters (October 1987 Black Monday, 1929 Black Thursday) driven by human emotions, fear, and panic. Weather patterns and seasonal shifts also play nonscientific, behavioral roles.
`
  },
  {
    id: "doc_disaster_mgmt",
    title: "Handbook on Disaster Management - India Focus",
    category: "Disaster Management",
    summary: "An extensive handbook highlighting the hazards, vulnerabilities, mitigation strategies, and preparedness frameworks in India for major natural and human-induced disasters.",
    createdAt: "2026-05-22T09:47:52Z",
    content: `## Handbook on Disaster Management

### CHAPTER-I: INTRODUCTION
India is one of the most disaster-prone countries in the world. About 60 percent of the landmass is reported to be susceptible to seismic activity and about 18 percent of the country's total area is drought prone. About 40 million hectares of land in the country has been identified as flood prone. Hilly regions are at risk from landslides and avalanches, and close to 5,700 km of the 7,516 km coastline is prone to cyclones and tsunamis.

#### Urbanization Gaps & Vulnerability
Increasing urbanization, expansion of habitats into unsuitable vulnerable areas, higher population and housing density, non-engineered unsafe constructions, and aging infrastructures have significantly increased vulnerability in urban areas. Poor planning of drainage systems has caused prolonged waterlogging and urban floods in major metropolises.

| Year | Percentage of Urban Population | Number of Municipal Towns | Total Population (Millions) | Urban Population (Millions) |
|------|-------------------------------|---------------------------|-----------------------------|-----------------------------|
| 1901 | 10.8                          | 1827                      | 238.39                      | 25.85                       |
| 1951 | 17.3                          | 2843                      | 361.23                      | 62.44                       |
| 2001 | 27.8                          | 5161                      | 1027.00                     | 285.00                      |

### CHAPTER-II: HAZARDS AND DISASTERS
Hazards can be classified into two broad categories:
1. **Natural Hazards:** Meteorological, geological, or biological in origin (Earthquakes, cyclones, tsunamis, floods).
2. **Unnatural Hazards:** Human-caused or technological in origin (Chemical leaks, nuclear radiation, building collapses, serial blasts, transport accidents).

**Vulnerability** is the extent to which a community, structure, service, or geographic area is likely to be damaged or disrupted by the impact of a particular hazard on account of its nature, construction, and proximity to hazardous terrains.

### CHAPTER-III: EARTHQUAKES
The Indian plate moves northward and collides with the Eurasian Plate, generating the Himalayas. This is the main cause of intense earthquakes from the Himalayas to the Arakan Yoma. Geographically, Zone V (Very High Risk) includes Kashmir, the western Himalayas, Northeast India, northern Bihar, and the Rann of Kutch.

#### Modified Mercalli (MM) / MSK Intensity Scale
* **Scale 1-4:** Barely felt to felt indoors by many, windows disturbed.
* **Scale 5-6:** Felt by nearly everyone, cracked plaster, fallen plaster or damaged chimneys.
* **Scale 7-8:** Negligible/slight damage in well-designed structures; great damage in poorly built or badly designed structures; factory stacks/walls collapse.
* **Scale 9-10:** Ground cracked conspicuously; most masonry and frame structures destroyed; underground pipes broken.
* **Scale 11-12:** Bridges destroyed, underground pipelines out of service, damage total.

#### Principles of Quake-Resisting Construction
* Minimize building inertia through light building materials and thin walls.
* Establish corner reinforcement, corner bands, and lintel bands.
* Use ductile, high-grade steel/bamboo reinforcement.

### CHAPTER-IV: TSUNAMIS
Tsunamis (meaning "harbor waves" in Japanese) are giant waves generated by under-sea earthquakes or fault movements on the sea floor, volcanic eruptions, or submarine landslides.

When the undersea earthquake occurs deep in the ocean, waves travel at speeds of up to 800 km/hr with low amplitude (amplitude under 1 meter). As they approach shallow coastal waters, their speed decreases but their amplitude increases dramatically to 10-15 meters, destroying coastal settlements.

#### Tsunami Mitigation Strategies
* **Vegetative Coastal Barriers:** Preservation and planting of mangroves, casuarinas, and coconuts along beaches to absorb the energy of incoming waves.
* **Engineered Protection:** Construct houses on elevated ground, preferably on columns or stilts where structural columns resist wave impact.
* **Early Warning:** Continuous monitoring through DART buoys and immediate transmission to coastal emergency centers.

### CHAPTER-V: CYCLONES
Tropical cyclones are intense low-pressure systems developing over warm oceans, spirals with winds ranging from 65 km/hr to over 222 km/hr (Super Cyclones).
* **Storm Surge:** Sudden normal rise in sea level caused by low pressure and winds, washing seawater up to 15-30 km inland, acting as the primary disaster killer.
* **Shelterbelts:** Scientific casuarina plantations along coastal fringes acting as coastal breakwaters.

### CHAPTER-VI: FLOODS
Floods represent a recurring event in chronically flood-prone plains of the Ganges, Brahmaputra, and other river systems. It inundates villages, agricultural grounds, and city basements. 
* **Mitigation:** Embankments, reservoirs, check dams, and flood zoning/proofing by raising village homesteads on elevated platforms above historic high flood levels.

### CHAPTER-VII: DROUGHTS
Drought is an insidious natural hazard resulting from prolonged deficiency of rainfall. It is classified as:
* **Meteorological Drought:** Deficiency of rainfall compared to long-term averages.
* **Hydrological Drought:** Drying up of surface water resources like rivers, ponds, and groundwater.
* **Agricultural Drought:** Moisture stress affecting crop health and yields.

#### Mitigation Options
* Watershed development, rainwater harvesting, check dams and bandharas.
* Drip and sprinkler micro-irrigation systems.
* Alternative crop planning and contingency seed bank reserves.

### CHAPTER-VIII: LANDSLIDES
Landslides constitute a major geological hazard in the Himalayan, Western Ghat, and Nilgiri ranges.
* **Causative Factors:** Slopes modified by human construction, lack of vegetative cover, intense rainfall, and seismic shaking.
* **Mitigation:** Retaining walls, slope stabilization using geotextiles, surface drainage controls, and robust afforestation.
`
  }
];
