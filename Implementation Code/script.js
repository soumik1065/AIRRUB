let requirements = [];
let currentRequirement = null;

function showAddRequirement() {
    const html = `
        <button onclick="showRequirementForm()">Add Requirement</button>
        <div id="formContainerInner"></div>
    `;
    document.getElementById("formContainer").innerHTML = html;
}


function showRequirementForm() {
    const form = `
        <label>Requirement Name:</label>
        <math-field id="reqName" virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1.2em;"></math-field>

        <label>Requirement Meaning:</label>
        <input id="reqMeaning" style="width: 100%; font-size: 1em;" placeholder="Enter requirement meaning" />

        <label>Equation:</label>
        <math-field id="reqEquation" virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1.3em;"></math-field>

        <button onclick="submitRequirement()">Submit Requirement</button>
        <div id="reqMessage" style="margin-top: 0.5rem; color: green;"></div>
        <div id="parameterSection" style="display:none; margin-top: 1rem;">
            <button onclick="showAddParameter()">Add Parameter</button>
            <div id="paramFields"></div>
            <button id="showTaxonomyBtn" style="margin-top: 1rem;">Show Taxonomy</button>
            <button onclick="downloadCSV()">Download CSV</button>
        </div>
    `;
    document.getElementById("formContainerInner").innerHTML = form;

    setTimeout(() => {
        const showButton = document.getElementById("showTaxonomyBtn");
        if (showButton) {
            showButton.addEventListener("click", displayTaxonomy);
        }
    }, 0);
}








function convertLatexToReadable(latex) {
    if (!latex) return "";

    const superscriptMap = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
        'n': 'ⁿ', 'i': 'ⁱ'
    };

    const subscriptMap = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
        'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
        'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
        'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
        'v': 'ᵥ', 'x': 'ₓ', 'y': 'ᵧ', 'z': '𝓏'
    };

    const toSuperscript = (_, base, exp) => {
        const converted = exp.split('').map(char => superscriptMap[char] || char).join('');
        return base + converted;
    };

    return latex
        .replace(/\\frac\s*{([^{}]+)}\s*{([^{}]+)}/g, '($1 / $2)')
        .replace(/\\sqrt\s*{([^{}]+)}/g, '√($1)')
        .replace(/\^\{([^}]+)\}/g, toSuperscript)
        .replace(/\^([0-9])/g, (_, d) => superscriptMap[d] || `^${d}`)

        .replace(/\\theta/g, 'θ')
        .replace(/\\pi/g, 'π')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')

        .replace(/\\cdot/g, '*')

        // Trigonometric functions
        .replace(/\\tan\s*\(([^)]+)\)/g, 'tan($1)')
        .replace(/\\tan\s*([a-zA-Z0-9]+)/g, 'tan($1)')
        .replace(/\\sin\s*\(([^)]+)\)/g, 'sin($1)')
        .replace(/\\sin\s*([a-zA-Z0-9]+)/g, 'sin($1)')
        .replace(/\\cos\s*\(([^)]+)\)/g, 'cos($1)')
        .replace(/\\cos\s*([a-zA-Z0-9]+)/g, 'cos($1)')
        .replace(/\\log\s*\(([^)]+)\)/g, 'log($1)')
        .replace(/\\log\s*([a-zA-Z0-9]+)/g, 'log($1)')

        // Degree mode for constants
        .replace(/tan\((\d+(\.\d+)?)\)/g, 'tan($1 deg)')
        .replace(/cos\((\d+(\.\d+)?)\)/g, 'cos($1 deg)')
        .replace(/sin\((\d+(\.\d+)?)\)/g, 'sin($1 deg)')

        // Subscripts
        .replace(/_\{([^}]+)\}/g, (_, sub) => '₍' + sub + '₎')
        .replace(/_([a-zA-Z0-9])/g, (_, s) => subscriptMap[s] || '_' + s)

        // Cleanup
        .replace(/\\left\|/g, '|')
        .replace(/\\right\|/g, '|')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\int/g, '∫')
        .replace(/\\infty/g, '∞')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\,/g, '')
        .replace(/\\/g, '')

        // ✅ Added: convert base^number or base^{...} into (base)^number for math.js
        .replace(/([a-zA-Z0-9)\]])\^\{([^}]+)\}/g, '($1)^($2)')
        .replace(/([a-zA-Z0-9)\]])\^([0-9]+)/g, '($1)^$2');
}



function submitRequirement() {
    const name = document.getElementById("reqName").value;
    const meaning = document.getElementById("reqMeaning")?.value || "";
    const latexEq = document.getElementById("reqEquation").value;
    const equation = convertLatexToReadable(latexEq);

    if (!name.trim()) {
        alert("Please enter a requirement name.");
        return;
    }

    currentRequirement = {
        name,
        meaning,
        equation,
        latexEquation: latexEq,
        parameters: []
    };

    requirements.push(currentRequirement);

    document.getElementById("output").innerHTML = "";
    document.getElementById("reqMessage").innerHTML = `Requirement <strong>\\(${name}\\)</strong> added successfully.`;
    MathJax.typeset();
    document.getElementById("parameterSection").style.display = "block";
}






function showAddParameter(parent = null, containerId = "paramFields") {
    const id = Date.now();
    const html = `
        <div class="parameter-group" id="paramGroup-${id}">
            <label>Parameter Name:</label>
            <math-field id="name-${id}" virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1em;"></math-field>
            
            <label>Parameter Meaning:</label>
            <input id="meaning-${id}" style="width: 100%; font-size: 1em;" placeholder="Enter parameter meaning" />

            <label>Type:</label>
            <select id="type-${id}" onchange="toggleHybrid(${id})">
                <option value="STATIC">STATIC</option>
                <option value="DYNAMIC">DYNAMIC</option>
                <option value="HYBRID">HYBRID</option>
                <option value="UNKNOWN">UNKNOWN</option>
            </select>
            <div id="extra-${id}">
                <label>Admissible Min:</label><input type="number" id="min-${id}" />
                <label>Admissible Max:</label><input type="number" id="max-${id}" />
                <label>Desirable Min:</label><input type="number" id="desMin-${id}" />
                <label>Desirable Max:</label><input type="number" id="desMax-${id}" />
            </div>
            <div id="hybrid-${id}" style="display:none;">
                <label>Hybrid Equation:</label>
                <math-field id="equation-${id}" virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1.1em;"></math-field>
                <div id="existing-params-${id}"></div>
                <div id="hybrid-container-${id}"></div>
                <div id="dynamic-added-${id}"></div>
                <button onclick="showAddParameter(null, 'hybrid-container-${id}')">Add Dependent</button>
            </div>
            ${containerId === "paramFields" ? `<button onclick="submitParameter(${id}, this)">Submit Parameter</button>` : ``}
        </div>
    `;
    document.getElementById(containerId).insertAdjacentHTML("beforeend", html);
    if (parent) parent.remove();
}

function toggleHybrid(id) {
    const type = document.getElementById(`type-${id}`).value;
    const extra = document.getElementById(`extra-${id}`);
    const hybrid = document.getElementById(`hybrid-${id}`);
    const existingContainer = document.getElementById(`existing-params-${id}`);
    const dynamicContainer = document.getElementById(`dynamic-added-${id}`);

    if (type === "HYBRID") {
        extra.style.display = "none";
        hybrid.style.display = "block";

        const existingParams = currentRequirement?.parameters?.filter(p => p.type !== "HYBRID") || [];

        if (existingParams.length > 0) {
            let listHtml = `<p><strong>Select existing parameters as dependents:</strong></p><ul>`;
            existingParams.forEach((p, index) => {
                listHtml += `<li>
                    <label>
                        <input id="new" type="checkbox" onchange="addExistingDependent(${id}, ${index}, this)" />
                        \\(${p.name}\\) (${p.type})
                    </label>
                </li>`;

            });
            listHtml += `</ul>`;
            existingContainer.innerHTML = listHtml;
            MathJax.typeset();

        } else {
            existingContainer.innerHTML = "<p><em>No existing STATIC or DYNAMIC parameters to select.</em></p>";
        }

        dynamicContainer.innerHTML = "";
    } else {
        extra.style.display = "block";
        hybrid.style.display = "none";
    }
}

function addExistingDependent(parentId, paramIndex, checkbox) {
    const container = document.getElementById(`dynamic-added-${parentId}`);
    const selectedParam = currentRequirement.parameters[paramIndex];
    const itemId = `dep-${parentId}-${paramIndex}`;

    if (checkbox.checked) {
        const html = `
            <div class="parameter-group" id="${itemId}">
                <p><strong>${selectedParam.name}</strong> (${selectedParam.type})</p>
                <p>Admissible: Min=${selectedParam.minRange}, Max=${selectedParam.maxRange}</p>
                <p>Desirable: Min=${selectedParam.desirableMin}, Max=${selectedParam.desirableMax}</p>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", html);
    } else {
        const item = document.getElementById(itemId);
        if (item) item.remove();
    }
}



function submitParameter(id, btn) {
    const name = document.getElementById(`name-${id}`).value;
    const type = document.getElementById(`type-${id}`).value;
    const param = { name, type };
    param.meaning = document.getElementById(`meaning-${id}`)?.value || "";


    if (type === "HYBRID") {
        const latexParamEq = document.getElementById(`equation-${id}`).value;
        param.equation = convertLatexToReadable(latexParamEq);
        param.latexEquation = latexParamEq;

        param.dependents = [];

        // Collect checkbox-based dependents
        const existingCheckboxes = document.querySelectorAll(`#existing-params-${id} input[type="checkbox"]:checked`);
        existingCheckboxes.forEach(checkbox => {
            const label = checkbox.parentElement.textContent.trim();
            const paramName = label.split(" (")[0];
            const existing = currentRequirement.parameters.find(p => p.name === paramName);
            if (existing) param.dependents.push(existing);
        });

        // Collect dynamic nested parameters
        const container = document.getElementById(`hybrid-container-${id}`);
        const children = container.querySelectorAll('[id^="paramGroup-"]');
        children.forEach(c => {
            const childId = c.id.split("-")[1];
            param.dependents.push(getParameterData(childId));
        });

        // Remove duplicates by normalized name
        param.dependents = param.dependents.filter((dep, index, self) =>
            index === self.findIndex(d =>
                d.name.replace(/\s+/g, '').trim() === dep.name.replace(/\s+/g, '').trim()
            )
        );
    } else {
        param.minRange = document.getElementById(`min-${id}`).value;
        param.maxRange = document.getElementById(`max-${id}`).value;
        param.desirableMin = document.getElementById(`desMin-${id}`).value;
        param.desirableMax = document.getElementById(`desMax-${id}`).value;
    }

    currentRequirement.parameters.push(param);
    document.getElementById(`paramGroup-${id}`).innerHTML = `<p>Parameter \\(${name}\\) added.</p>`;
    MathJax.typeset();
}

function getParameterData(id) {
    const name = document.getElementById(`name-${id}`).value;

    const type = document.getElementById(`type-${id}`).value;
    const param = { name, type };

    if (type === "HYBRID") {
        param.equation = document.getElementById(`equation-${id}`).value;
        param.dependents = [];

        const container = document.getElementById(`hybrid-container-${id}`);
        const children = container.querySelectorAll('[id^="paramGroup-"]');
        children.forEach(c => {
            const childId = c.id.split("-")[1];
            param.dependents.push(getParameterData(childId));
        });
    } else {
        param.minRange = document.getElementById(`min-${id}`).value;
        param.maxRange = document.getElementById(`max-${id}`).value;
        param.desirableMin = document.getElementById(`desMin-${id}`).value;
        param.desirableMax = document.getElementById(`desMax-${id}`).value;
    }

    return param;
}





function flattenParameter(param, reqName, reqEq, parentName, rows, seen = new Set()) {
    if (seen.has(param.name)) return;
    seen.add(param.name);

    const row = [
        reqName,
        currentRequirement.meaning || "",
        reqEq,
        param.name,
        param.meaning || "",
        param.type,
        param.type === "HYBRID" ? param.latexEquation : "",
        param.type !== "HYBRID" ? param.minRange : "",
        param.type !== "HYBRID" ? param.maxRange : "",
        param.type !== "HYBRID" ? param.desirableMin : "",
        param.type !== "HYBRID" ? param.desirableMax : "",
        parentName || ""
    ];
    rows.push(row);

    if (param.type === "HYBRID" && Array.isArray(param.dependents)) {
        param.dependents.forEach(child => {
            flattenParameter(child, reqName, reqEq, param.name, rows, seen);
        });
    }
}




function downloadCSV() {
    // const rows = [["Requirement Name", "Equation", "Parameter Name", "Type", "Parameter Equation", "Admissible Min", "Admissible Max", "Desirable Min", "Desirable Max", "Parent Chain"]];
    const rows = [["Requirement Name", "Requirement Meaning", "Equation", "Parameter Name", "Parameter Meaning", "Type", "Parameter Equation", "Admissible Min", "Admissible Max", "Desirable Min", "Desirable Max", "Parent Chain"]];

    const seen = new Set();

    requirements.forEach(req => {
        req.parameters.forEach(param => {
            flattenParameter(param, req.name, req.latexEquation, "", rows, seen);

        });
    });

    const csvContent = rows.map(r => r.map(cell => `"${cell ?? ''}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "taxonomy.csv";
    link.click();
}



function displayTaxonomy() {
    const output = document.getElementById("output");
    output.innerHTML = "";

    function getSafeValue(val) {
        return (val !== undefined && val !== null && val !== "") ? val : "N/A";
    }

    function formatRange(param, prefix) {
        let min, max;
        if (prefix === 'admissible') {
            min = getSafeValue(param.minRange);
            max = getSafeValue(param.maxRange);
        } else {
            const minKey = `${prefix}Min`;
            const maxKey = `${prefix}Max`;
            min = getSafeValue(param[minKey]);
            max = getSafeValue(param[maxKey]);
        }
        return `Min=${min}, Max=${max}`;
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function renderParameter(param) {
        const paramDiv = document.createElement("div");
        paramDiv.className = "parameter";

        const meaning = param.meaning ? `<p><em>Meaning:</em> ${param.meaning}</p>` : "";

        if (param.type === "HYBRID") {
            const header = document.createElement("div");
            header.className = "hybrid-header";
            header.innerHTML = `➤ \\(${param.name}\\) (HYBRID)`;
            header.onclick = () => paramDiv.classList.toggle("expanded");

            const details = document.createElement("div");
            details.className = "hybrid-details";
            details.innerHTML = `
                ${meaning}
                <p><strong>Hybrid Equation:</strong> \\(${param.latexEquation || param.equation || 'N/A'}\\)</p>
            `;

            if (Array.isArray(param.dependents) && param.dependents.length > 0) {
                const depTitle = document.createElement("p");
                depTitle.innerHTML = "<strong>Dependent Parameters:</strong>";
                details.appendChild(depTitle);

                param.dependents.forEach(dep => {
                    const clonedDep = deepClone(dep);
                    const nested = renderParameter(clonedDep);
                    details.appendChild(nested);
                });
            }

            paramDiv.appendChild(header);
            paramDiv.appendChild(details);
        } else {
            paramDiv.innerHTML = `
                <p><strong>\\(${param.name}\\)</strong> (${param.type})</p>
                ${meaning}
                <p>
                    Admissible: ${formatRange(param, "admissible")}<br>
                    Desirable: ${formatRange(param, "desirable")}
                </p>
            `;
        }

        return paramDiv;
    }

    requirements.forEach(req => {
        const section = document.createElement("div");
        section.className = "requirement-section";

        const title = document.createElement("h3");
        title.innerHTML = `Requirement: \\(${req.name}\\)`;
        section.appendChild(title);

        if (req.meaning) {
            const meaning = document.createElement("p");
            meaning.innerHTML = `<em>Meaning:</em> ${req.meaning}`;
            section.appendChild(meaning);
        }

        const equation = document.createElement("p");
        equation.innerHTML = `<strong>Equation:</strong> \\(${req.latexEquation || req.equation || "N/A"}\\)`;
        section.appendChild(equation);

        req.parameters.forEach(param => {
            const rendered = renderParameter(param);
            section.appendChild(rendered);
        });

        output.appendChild(section);
    });

    MathJax.typeset();
}








function openImportModal() {
    document.getElementById("importModal").style.display = "block";
}

function closeImportModal() {
    document.getElementById("importModal").style.display = "none";
}

function displayFromModal() {
    const fileInput = document.getElementById("csvModalInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    // ✅ Display the CSV file name at the top
    const infoBox = document.getElementById("importedTaxonomyInfo");
    infoBox.textContent = `Imported Taxonomy File: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        displayStructuredCSV(csvText);
        closeImportModal();
    };
    reader.readAsText(file);
}


function displayStructuredCSV(csvText) {
    const parsed = Papa.parse(csvText.trim(), {
        header: false,
        skipEmptyLines: true
    });

    const rows = parsed.data;
    const header = rows[0];
    const data = rows.slice(1);

    const grouped = {};
    data.forEach(row => {
        const [reqName, reqMeaning, equation, paramName, paramMeaning, type, paramEq, admMin, admMax, desMin, desMax, parentChain] = row;
        if (!grouped[reqName]) grouped[reqName] = { meaning: reqMeaning, equation, parameters: [] };
        grouped[reqName].parameters.push({
            paramName,
            paramMeaning,
            type,
            paramEq,
            latexEquation: type === "HYBRID" ? paramEq : "",
            admMin,
            admMax,
            desMin,
            desMax,
            parentChain
        });
    });

    const output = document.getElementById("output");
    output.innerHTML = "";

    Object.entries(grouped).forEach(([reqName, { meaning, equation, parameters }], reqIndex) => {
        const section = document.createElement("div");
        section.className = "requirement-section";
        section.innerHTML = `
            <h3>Requirement: 
                <math-field id="reqName-${reqIndex}" virtual-keyboard-mode="onfocus" class="math-field-wide">
                    ${reqName}
                </math-field>
            </h3>
            <p><strong>Meaning:</strong> 
                <input id="reqMeaning-${reqIndex}" class="full-width" value="${meaning || ''}" />
            </p>
            <p><strong>Equation:</strong> 
                <math-field id="reqEq-${reqIndex}" virtual-keyboard-mode="onfocus" class="math-field-wide">
                    ${equation}
                </math-field>
            </p>

            <button onclick="addParameterRow(${reqIndex})">Add Parameter</button>
            <button onclick="deleteRequirement(${reqIndex})">Delete Requirement</button>

            <table class="param-table" id="paramTable-${reqIndex}">
                <thead>
                    <tr>
                        <th>Parameter Name</th>
                        <th>Parameter Meaning</th>
                        <th>Type</th>
                        <th>Equation</th>
                        <th>Adm Min</th>
                        <th>Adm Max</th>
                        <th>Des Min</th>
                        <th>Des Max</th>
                        <th>Parent</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${parameters.map((p, i) => `
                        <tr id="paramRow-${reqIndex}-${i}">
                            <td><math-field virtual-keyboard-mode="onfocus" class="math-field-wide">${p.paramName}</math-field></td>
                            <td><input class="full-width" value="${p.paramMeaning || ''}" /></td>
                            <td>
                                <select class="full-width">
                                    <option value="STATIC" ${p.type === "STATIC" ? "selected" : ""}>STATIC</option>
                                    <option value="DYNAMIC" ${p.type === "DYNAMIC" ? "selected" : ""}>DYNAMIC</option>
                                    <option value="HYBRID" ${p.type === "HYBRID" ? "selected" : ""}>HYBRID</option>
                                    <option value="UNKNOWN" ${p.type === "UNKNOWN" ? "selected" : ""}>UNKNOWN</option>
                                </select>
                            </td>
                            <td><math-field virtual-keyboard-mode="onfocus" class="math-field-wide">${p.paramEq}</math-field></td>
                            <td><input class="full-width" value="${p.admMin}" /></td>
                            <td><input class="full-width" value="${p.admMax}" /></td>
                            <td><input class="full-width" value="${p.desMin}" /></td>
                            <td><input class="full-width" value="${p.desMax}" /></td>
                            <td><math-field virtual-keyboard-mode="onfocus" class="math-field-wide">${p.parentChain}</math-field></td>
                            <td><button onclick="deleteParameterRow(${reqIndex}, ${i})">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        output.appendChild(section);
    });

    output.innerHTML += `<button onclick="saveEditedCSV()">Save CSV</button>`;
    output.innerHTML += `<button onclick="displayTaxonomyGraph()">Display Basic Clusters</button>`;
    MathJax.typeset();
}





function addParameterRow(reqIndex) {
    const table = document.querySelector(`#paramTable-${reqIndex} tbody`);
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td><math-field virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1em;"></math-field></td>
        <td><input class="full-width" placeholder="Enter parameter meaning" /></td>
        <td>
            <select>
                <option value="STATIC">STATIC</option>
                <option value="DYNAMIC">DYNAMIC</option>
                <option value="HYBRID">HYBRID</option>
                <option value="UNKNOWN">UNKNOWN</option>
            </select>
        </td>
        <td><math-field virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1em;"></math-field></td>
        <td><input class="full-width" /></td>
        <td><input class="full-width" /></td>
        <td><input class="full-width" /></td>
        <td><input class="full-width" /></td>
        <td><math-field virtual-keyboard-mode="onfocus" style="width: 100%; font-size: 1em;"></math-field></td>
        <td><button onclick="this.closest('tr').remove()">Delete</button></td>
    `;
    table.appendChild(newRow);
    MathJax.typeset();
}



function deleteRequirement(reqIndex) {
    document.querySelectorAll(".requirement-section")[reqIndex]?.remove();
}

function deleteParameterRow(reqIndex, paramIndex) {
    const row = document.getElementById(`paramRow-${reqIndex}-${paramIndex}`);
    if (row) row.remove();
}




function saveEditedCSV() {
    const reqSections = document.querySelectorAll(".requirement-section");
    const rows = [["Requirement Name", "Requirement Meaning", "Equation", "Parameter Name", "Parameter Meaning", "Type", "Parameter Equation", "Admissible Min", "Admissible Max", "Desirable Min", "Desirable Max", "Parent Chain"]];

    reqSections.forEach((section, reqIdx) => {
        const reqNameEl = section.querySelector(`#reqName-${reqIdx}`);
        const reqEqEl = section.querySelector(`#reqEq-${reqIdx}`);
        const reqMeaningEl = section.querySelector(`#reqMeaning-${reqIdx}`);

        const reqName = reqNameEl?.getValue?.() || reqNameEl?.value || "";
        const reqEq = reqEqEl?.getValue?.() || reqEqEl?.value || "";
        const reqMeaning = reqMeaningEl?.value || "";

        const paramRows = section.querySelectorAll(`#paramTable-${reqIdx} tbody tr`);

        paramRows.forEach(row => {
            const mathFields = row.querySelectorAll("math-field");
            const inputs = row.querySelectorAll("input");
            const selects = row.querySelectorAll("select");

            const paramName = mathFields[0]?.getValue?.() || "";
            const paramMeaning = inputs[0]?.value || "";
            const type = selects[0]?.value || "";
            const paramEq = mathFields[1]?.getValue?.() || "";

            const admMin = inputs[1]?.value || "";
            const admMax = inputs[2]?.value || "";
            const desMin = inputs[3]?.value || "";
            const desMax = inputs[4]?.value || "";
            const parent = mathFields[2]?.getValue?.() || "";

            rows.push([
                reqName,
                reqMeaning,
                reqEq,
                paramName,
                paramMeaning,
                type,
                paramEq,
                admMin,
                admMax,
                desMin,
                desMax,
                parent
            ]);
        });
    });

    const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "edited_taxonomy.csv";
    link.click();
}




function displayTaxonomyGraph() {
    const fileInput = document.getElementById("csvModalInput");
    const file = fileInput?.files?.[0];

    if (!file) {
        alert("Please import a CSV file first through 'Import Taxonomy'.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        prepareGraphSelector(csvText);
    };
    reader.readAsText(file);
}


let cachedCSVData = "";

function prepareGraphSelector(csvText) {
    cachedCSVData = csvText;  // Store for later use

    const rows = csvText.trim().split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '')));
    const data = rows.slice(1);

    const requirements = [...new Set(data.map(row => row[0]))];

    const container = document.getElementById("graphSelector");
    container.innerHTML = "<h3>Select Requirements to Display:</h3>";

    requirements.forEach((req, idx) => {
        const readable = `\\(${convertLatexToReadable(req)}\\)`;  // Render requirement name as math
        container.innerHTML += `
            <label style="display: inline-flex; align-items: center; margin-bottom: 6px; gap: 8px; font-weight: normal;">
                <input type="checkbox" value="${req}" checked />
                ${readable}
            </label><br/>
        `;
    });
    MathJax.typeset();  // Re-render math

    container.innerHTML += `<button onclick="drawFilteredGraph()">Display Graph</button>`;
    container.style.display = "block";
}

function drawFilteredGraph() {
    const checkboxes = document.querySelectorAll('#graphSelector input[type="checkbox"]:checked');
    const selectedReqs = Array.from(checkboxes).map(cb => cb.value);

    if (selectedReqs.length === 0) {
        alert("Please select at least one requirement.");
        return;
    }

    drawGraphFromCSV(cachedCSVData, selectedReqs);
}



function drawGraphFromCSV(csvText, selectedReqs) {
    const parsed = Papa.parse(csvText.trim(), {
        header: false,
        skipEmptyLines: true
    });
    const rows = parsed.data;
    const data = rows.slice(1);

    const nodes = [];
    const edges = [];
    const nodeSet = new Set();
    const colorMap = {
        "STATIC": "red",
        "DYNAMIC": "green",
        "HYBRID": "gold",
        "UNKNOWN": "#A9A9A9",
        "NaN": "violet"
    };

    data.forEach(row => {
        const [reqName, , equation, paramName, , type, , , desMin, desMax, , parentChain] = row;
        if (!selectedReqs.includes(reqName)) return;

        const readableReq = convertLatexToReadable(reqName);
        const readableParam = convertLatexToReadable(paramName);

        if (!nodeSet.has(reqName)) {
            let label = readableReq;
            const opt = window.optimizationResults?.[readableReq.replace(/\s+/g, '')];
            if (opt) {
                const optVal = opt.value?.toFixed(2);
                const optRange = opt.paramRanges?.__output;
                if (optVal) label += `\nopt = ${optVal}`;
                if (optRange && optRange !== "N/A") {
                    const parts = optRange.split("–").map(s => parseFloat(s).toFixed(2));
                    label += `\n[${parts.join("–")}]`;
                }
            }
            nodes.push({
                id: reqName,
                label,
                color: "violet",
                shape: "box"
            });
            nodeSet.add(reqName);
        }

        if (paramName && !nodeSet.has(paramName)) {
            const nodeColor = colorMap[type?.trim()] || "gray";
            nodes.push({ id: paramName, label: readableParam, color: nodeColor });
            nodeSet.add(paramName);
        }

        // Format edge label (desirable range) short
        let edgeLabel = "";
        const min = parseFloat(desMin);
        const max = parseFloat(desMax);

        if (!isNaN(min) && !isNaN(max)) {
            edgeLabel = `${min.toFixed(2)}–${max.toFixed(2)}`;
        } else if (!isNaN(min)) {
            edgeLabel = `≥ ${min.toFixed(2)}`;
        } else if (!isNaN(max)) {
            edgeLabel = `≤ ${max.toFixed(2)}`;
        }

        const parent = parentChain || reqName;
        edges.push({ from: parent, to: paramName, label: edgeLabel });
    });

    const container = document.getElementById("graphContainer");
    container.style.display = "block";

    const dataSet = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        layout: {
            hierarchical: {
                direction: "UD",
                sortMethod: "directed"
            }
        },
        edges: {
            arrows: "to",
            font: { align: "middle" },
            color: { color: "black", highlight: "black", hover: "black" }
        },
        nodes: {
            shape: "box",
            font: { color: "#fff", size: 18 },
            widthConstraint: { minimum: 60 },
            heightConstraint: { minimum: 40 }
        },
        physics: false
    };

    new vis.Network(container, dataSet, options);

    const legend = `
        <h4>Colour Code:</h4>
        <ul style="list-style: none; padding-left: 0;">
            <li><span style="display: inline-block; width: 20px; height: 20px; background: violet; margin-right: 10px;"></span>Requirement Name</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: red; margin-right: 10px;"></span>STATIC Parameter</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: green; margin-right: 10px;"></span>DYNAMIC Parameter</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: gold; margin-right: 10px;"></span>HYBRID Parameter</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: #A9A9A9; margin-right: 10px;"></span>UNKNOWN Parameter</li>
        </ul>
    `;

    const legendContainer = document.getElementById("graphLegend");
    legendContainer.innerHTML = legend;
    legendContainer.style.display = "block";

    container.scrollIntoView({ behavior: "smooth" });
}







let pdfFile = null;
let pdfScale = 1.2;
let pdfDoc = null;

function openPDFModal() {
    document.getElementById("pdfModal").style.display = "block";
}

function closePDFModal() {
    document.getElementById("pdfModal").style.display = "none";
}

document.getElementById("pdfInput").addEventListener("change", function (e) {
    pdfFile = e.target.files[0];
    if (pdfFile) {
        document.getElementById("pdfTitle").textContent = pdfFile.name;
    }
});

function renderPDF() {
    if (!pdfFile) {
        alert("Please select a PDF file first.");
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            pdfDoc = pdf;
            displayAllPages();
            closePDFModal();
        });
    };

    fileReader.readAsArrayBuffer(pdfFile);
}

function displayAllPages(onRendered) {
    const viewer = document.getElementById("pdfViewer");
    viewer.innerHTML = "";

    let pagesRendered = 0;

    const renderPage = (num) => {
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: pdfScale });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.marginBottom = "1rem";
            canvas.style.border = "1px solid #ccc";
            viewer.appendChild(canvas);

            page.render({ canvasContext: context, viewport }).promise.then(() => {
                pagesRendered++;
                if (pagesRendered === pdfDoc.numPages && typeof onRendered === "function") {
                    onRendered();
                }
                if (num < pdfDoc.numPages) {
                    renderPage(num + 1);
                }
            });
        });
    };

    renderPage(1);
}

function zoomPDF(direction) {
    if (!pdfDoc) return;

    const viewer = document.getElementById("pdfViewer");
    const scrollTopBefore = viewer.scrollTop;
    const scrollHeightBefore = viewer.scrollHeight;

    pdfScale += direction === 'in' ? 0.2 : -0.2;
    pdfScale = Math.max(0.4, Math.min(pdfScale, 3));

    displayAllPages(() => {
        const scrollHeightAfter = viewer.scrollHeight;
        const scrollRatio = scrollTopBefore / scrollHeightBefore;
        viewer.scrollTop = scrollRatio * scrollHeightAfter;
    });
}



function parameterOptimize() {
    const fileInput = document.getElementById("csvModalInput");
    const file = fileInput?.files?.[0];

    if (!file) {
        alert("Please import a CSV file first using 'Import Taxonomy'.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        cachedCSVData = csvText;  // ✅ Store for reuse
        showRequirementList(csvText);  // Show requirements to select
    };
    reader.readAsText(file);
}



function showRequirementList(csvText) {
    const rows = csvText.trim().split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '')));
    const data = rows.slice(1);

    const requirements = [...new Set(data.map(row => row[0]))];

    const output = document.getElementById("output");
    output.innerHTML = "";

    // ✅ Create and insert the selector section first
    const selectorDiv = document.createElement("div");
    selectorDiv.id = "graphSelector";
    selectorDiv.innerHTML = "<h3>Select Requirements for Parameter Optimization:</h3>";

    requirements.forEach(req => {
        const readable = `\\(${convertLatexToReadable(req)}\\)`;  // Rendered math version
        selectorDiv.innerHTML += `
            <label style="display: inline-flex; align-items: center; margin-bottom: 6px; gap: 8px; font-weight: normal;">
                <input type="checkbox" value="${req}" checked />
                ${readable}
            </label><br/>
        `;
    });

    selectorDiv.innerHTML += `<button onclick="optimizeSelectedRequirements()">Optimize</button>`;
    output.appendChild(selectorDiv);

    MathJax.typeset();  // ✅ Trigger MathJax to render equations
}




function optimizeSelectedRequirements() {
    const selectedReqs = Array.from(document.querySelectorAll('#graphSelector input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (selectedReqs.length === 0) {
        alert("Please select at least one requirement to optimize.");
        return;
    }

    const parsed = Papa.parse(cachedCSVData.trim(), {
        header: false,
        skipEmptyLines: true
    });
    const rows = parsed.data;
    const data = rows.slice(1);

    const output = document.getElementById("output");

    selectedReqs.forEach(reqName => {
        const reqRows = data.filter(row => row[0] === reqName);
        if (reqRows.length === 0) return;

        const [ , reqMeaning ] = reqRows[0];

        const reqDiv = document.createElement("div");
        reqDiv.style.marginTop = "2rem";
        reqDiv.innerHTML = `
            <h3>Configure Inputs for: ${reqName}</h3>
            ${reqMeaning ? `<p><em>Meaning:</em> ${reqMeaning}</p>` : ""}
        `;

        const form = document.createElement("form");
        form.setAttribute("data-requirement", reqName);

        reqRows.forEach(row => {
            const [ , , , paramName, paramMeaning, type, , admMin, admMax, desMin, desMax ] = row;
            if (!paramName || type === "HYBRID") return;

            const admMinVal = parseFloat(admMin);
            const admMaxVal = parseFloat(admMax);
            const desMinVal = parseFloat(desMin);
            const desMaxVal = parseFloat(desMax);

            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "1em";

            const checkboxId = `range-${paramName}`;
            const useRangeCheckbox = document.createElement("input");
            useRangeCheckbox.type = "checkbox";
            useRangeCheckbox.id = checkboxId;

            const label = document.createElement("label");
            label.innerHTML = `<strong>${paramName}</strong> (Admissible: ${admMinVal}-${admMaxVal}, Desirable: ${desMinVal}-${desMaxVal})`;
            label.setAttribute("for", checkboxId);

            const meaningText = paramMeaning?.trim() ? `<div><em>Meaning:</em> ${paramMeaning}</div>` : "";

            const input = document.createElement("input");
            input.type = "number";
            input.name = paramName;
            input.placeholder = `Enter value from SRS`;
            input.setAttribute("data-adm-min", admMinVal);
            input.setAttribute("data-adm-max", admMaxVal);
            input.setAttribute("data-des-min", desMinVal);
            input.setAttribute("data-des-max", desMaxVal);
            input.step = "0.0000001";

            useRangeCheckbox.addEventListener("change", () => {
                input.disabled = useRangeCheckbox.checked;
                input.style.border = "";
            });

            wrapper.appendChild(label);
            wrapper.appendChild(useRangeCheckbox);
            wrapper.appendChild(document.createTextNode(" Use Desirable Range"));
            wrapper.appendChild(document.createElement("br"));
            wrapper.innerHTML += meaningText;
            wrapper.appendChild(input);

            form.appendChild(wrapper);
        });

        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "10px";
        btnContainer.style.marginTop = "1rem";

        const runBtn = document.createElement("button");
        runBtn.type = "button";
        runBtn.textContent = "Run Optimization";
        runBtn.onclick = () => runFlexibleOptimize(form, reqRows, reqName);

        const clusterBtn = document.createElement("button");
        clusterBtn.type = "button";
        clusterBtn.textContent = "Display Basic Clusters";
        clusterBtn.onclick = () => prepareGraphFromResult(reqName);

        btnContainer.appendChild(runBtn);
        btnContainer.appendChild(clusterBtn);
        form.appendChild(btnContainer);

        reqDiv.appendChild(form);
        output.appendChild(reqDiv);
    });

    MathJax.typeset();
}





function convertLatexToMathJS(latex) {
    if (!latex) return "";

    // ✅ NEW: Handle nested \frac and \sqrt recursively
    const resolveNested = (input, pattern, replacer) => {
        let prev;
        do {
            prev = input;
            input = input.replace(pattern, replacer);
        } while (input !== prev);
        return input;
    };

    latex = resolveNested(latex, /\\frac\s*{([^{}]+)}\s*{([^{}]+)}/g, (_, a, b) => `(${a})/(${b})`);
    latex = resolveNested(latex, /\\sqrt\s*{([^{}]+)}/g, (_, x) => `sqrt(${x})`);

    // ✅ NEW: Handle \min and \max with left braces
    latex = latex.replace(/\\min\s*\\left\{([^}]+)\}/g, (_, exprs) => {
        return `min(${exprs.split(',').map(e => e.trim()).join(',')})`;
    });

    latex = latex.replace(/\\max\s*\\left\{([^}]+)\}/g, (_, exprs) => {
        return `max(${exprs.split(',').map(e => e.trim()).join(',')})`;
    });

    // 🔁 EXISTING LOGIC (unchanged)
    return latex
        .replace(/\\frac\s*{([^{}]+)}\s*{([^{}]+)}/g, '($1)/($2)')
        .replace(/\\sqrt\s*{([^{}]+)}/g, 'sqrt($1)')
        .replace(/\\min\s*(?:\\left)?\s*[{(]([^{}()]+)[})]\s*(?:\\right)?/g, 'min($1)')
        .replace(/\\max\s*(?:\\left)?\s*[{(]([^{}()]+)[})]\s*(?:\\right)?/g, 'max($1)')
        .replace(/\^\{([^}]+)\}/g, '^($1)')
        .replace(/(\([^()]+\))\^([0-9]+)/g, '($1)^$2')
        .replace(/([a-zA-Z0-9]+)\^([0-9]+)/g, '($1)^$2')
        .replace(/[²³]/g, m => ({ '²': '^2', '³': '^3' }[m]))
        .replace(/\\cdot/g, '*')
        .replace(/\\(left|right|,)/g, '')
        .replace(/\\[a-zA-Z]+/g, '')  // Remove leftover LaTeX commands
        .replace(/[\u2061\u202F]/g, '') // Remove invisible math symbols
        .replace(/\s+/g, '') // Remove whitespace
        .replace(/\\|{|}/g, '');
}




function runFlexibleOptimize(form, reqRows, reqName) {
    const normalize = str => str
        .replace(/\\[a-z]+/g, '')   // remove LaTeX commands like \right, \rbrace
        .replace(/[{}]/g, '')       // remove {, }
        .replace(/[^\w]/g, '')      // keep only alphanumeric/underscore
        .trim();

    const inputs = form.querySelectorAll("input[type='number']");
    const userValues = {};
    const rangeParams = {};
    let valid = true;

    inputs.forEach(input => {
        const rawName = input.name;
        const paramName = normalize(rawName);
        const checkbox = form.querySelector(`#range-${rawName}`);

        if (checkbox?.checked) {
            const desMin = parseFloat(input.getAttribute("data-des-min")) || 0;
            const desMax = parseFloat(input.getAttribute("data-des-max")) || 0;
            if (!isNaN(desMin) && !isNaN(desMax)) {
                rangeParams[paramName] = generateRange(desMin, desMax, 1);
            }
        } else {
            const val = parseFloat(input.value);
            const admMin = parseFloat(input.getAttribute("data-adm-min")) || 0;
            const admMax = parseFloat(input.getAttribute("data-adm-max")) || 0;

            if (isNaN(val) || val < admMin || val > admMax) {
                input.style.border = "2px solid red";
                valid = false;
            } else {
                userValues[paramName] = val;
                input.style.border = "";
            }
        }
    });

    if (!valid) {
        alert("Please correct the highlighted values that are out of admissible range.");
        return;
    }

    // 🛠 FIX: correct column index for main equation (index 2)
    const eqRaw = reqRows[0][2]; 
    const mainEq = convertLatexToMathJS(eqRaw);

    const hybridParams = {};
    reqRows.forEach(row => {
        const [, , , paramName, , type, paramEq] = row;
        const cleanName = normalize(paramName);
        if (type === "HYBRID" && paramEq?.trim()) {
            hybridParams[cleanName] = {
                expr: convertLatexToMathJS(paramEq)
            };
        }
    });

    const paramNames = Object.keys({ ...userValues, ...rangeParams });
    const staticParamSets = {};

    paramNames.forEach(p => {
        if (userValues[p] !== undefined) {
            staticParamSets[p] = { values: [userValues[p]] };
        } else if (rangeParams[p]) {
            staticParamSets[p] = { values: rangeParams[p] };
        }
    });

    const combinations = generateCombinations(staticParamSets);

    let bestValue = null;
    let bestCombo = null;
    const allResults = [];

    combinations.forEach(combo => {
        const scope = {};
        paramNames.forEach((name, i) => {
            scope[name] = combo[i];
        });

        // Evaluate hybrid parameters
        Object.entries(hybridParams).forEach(([name, obj]) => {
            try {
                scope[name] = math.evaluate(obj.expr, scope);
            } catch (e) {
                scope[name] = NaN;
                console.warn(`Failed to evaluate hybrid ${name}:`, e.message);
            }
        });

        try {
            const val = math.evaluate(mainEq, scope);
            if (!isNaN(val)) {
                allResults.push({ ...scope, __output: val });
                if (bestValue === null || val > bestValue) {
                    bestValue = val;
                    bestCombo = { ...scope };
                }
            }
        } catch (e) {
            console.warn(`Failed to evaluate main equation:`, e.message);
        }
    });

    const paramRanges = {};
    const outputVals = allResults.map(r => r.__output).filter(v => !isNaN(v));
    const reqRange = outputVals.length > 0
        ? `${Math.min(...outputVals).toFixed(7)} – ${Math.max(...outputVals).toFixed(7)}`
        : "N/A";
    paramRanges.__output = reqRange;

    Object.keys(bestCombo || {}).forEach(name => {
        const values = allResults.map(r => r[name]).filter(v => !isNaN(v));
        if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            paramRanges[name] = min === max
                ? `${min.toFixed(7)}`
                : `${min.toFixed(7)} – ${max.toFixed(7)}`;
        } else {
            paramRanges[name] = "N/A";
        }
    });

    // 🧠 Clear previous result if any
    const prev = form.parentElement.querySelector(".optimization-result");
    if (prev) prev.remove();

    const resultBlock = document.createElement("div");
    resultBlock.className = "optimization-result";
    resultBlock.innerHTML = `
        <h4>Recommended Values for: ${reqName}</h4>
        <ul>
            ${Object.entries(bestCombo || {}).map(([k, v]) => {
                if (userValues[k] !== undefined) {
                    return `<li>${k} = ${v.toFixed(7)}</li>`;
                } else if (paramRanges[k] && paramRanges[k] !== "N/A") {
                    return `<li>${k} ∈ [${paramRanges[k]}]</li>`;
                } else {
                    return "";
                }
            }).join("")}
        </ul>
        <p><strong>Optimized Output:</strong> ${bestValue !== null ? bestValue.toFixed(7) : "N/A"}</p>
        <hr/>
    `;
    form.parentElement.appendChild(resultBlock);

    // ✅ Store in global object
    window.optimizationResults = window.optimizationResults || {};
    window.optimizationResults[normalize(reqName)] = {
        value: bestValue,
        parameters: bestCombo,
        paramRanges
    };

    prepareGraphFromResult(reqName);
}




function prepareGraphFromResult(reqName) {
    const normalize = str => convertLatexToReadable(str).replace(/\s+/g, '');
    const normReqName = normalize(reqName);

    const parsed = Papa.parse(cachedCSVData.trim(), {
        header: false,
        skipEmptyLines: true
    });

    const rows = parsed.data;
    const data = rows.slice(1).filter(row => row[0] === reqName);

    const result = window.optimizationResults?.[normReqName];
    if (!result) {
        alert(`No optimization result found for "${reqName}".`);
        return;
    }

    const userValues = result.userValues || {};
    const paramRanges = result.paramRanges || {};

    const nodes = [];
    const edges = [];
    const nodeSet = new Set();
    const colorMap = {
        "STATIC": "red",
        "DYNAMIC": "green",
        "HYBRID": "gold",
        "UNKNOWN": "#A9A9A9",
        "NaN": "violet"
    };

    const readableReq = convertLatexToReadable(reqName);
    let label = readableReq;
    const optVal = result.value?.toFixed(7);
    const optRange = result.paramRanges?.__output;

    if (optVal) label += `\nopt = ${optVal}`;
    if (optRange && optRange !== "N/A") label += `\n∈ [${optRange}]`;

    nodes.push({
        id: reqName,
        label,
        color: "violet",
        shape: "box"
    });
    nodeSet.add(reqName);

    data.forEach(row => {
        const [ , , , paramName, , type, , , , , , parentChain ] = row;
        if (!paramName) return;

        const readableParam = convertLatexToReadable(paramName);

        if (!nodeSet.has(paramName)) {
            const color = colorMap[type?.trim()] || "gray";
            nodes.push({ id: paramName, label: readableParam, color });
            nodeSet.add(paramName);
        }

        let edgeLabel = "N/A";
        const normParam = readableParam.replace(/[^\w]/g, '');
        if (userValues[normParam] !== undefined) {
            edgeLabel = `= ${userValues[normParam].toFixed(7)}`;
        } else if (paramRanges[normParam]) {
            edgeLabel = `[${paramRanges[normParam]}]`;
        }

        edges.push({
            from: parentChain || reqName,
            to: paramName,
            label: convertLatexToReadable(edgeLabel)
        });
    });

    const container = document.getElementById("graphContainer");
    container.style.display = "block";

    const dataSet = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        layout: {
            hierarchical: {
                direction: "UD",
                sortMethod: "directed"
            }
        },
        edges: {
            arrows: "to",
            font: { align: "middle" },
            color: { color: "black", highlight: "black", hover: "black" }
        },
        nodes: {
            shape: "box",
            font: { color: "#fff", size: 18 },
            widthConstraint: { minimum: 60 },
            heightConstraint: { minimum: 40 }
        },
        physics: false
    };

    new vis.Network(container, dataSet, options);

    const legend = `
        <h4>Colour Code:</h4>
        <ul style="list-style: none; padding-left: 0;">
            <li><span style="display: inline-block; width: 20px; height: 20px; background: violet; margin-right: 10px;"></span>Requirement Name</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: red; margin-right: 10px;"></span>STATIC Parameter</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: green; margin-right: 10px;"></span>DYNAMIC Parameter</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: gold; margin-right: 10px;"></span>HYBRID Parameter</li>
            <li><span style="display: inline-block; width: 20px; height: 20px; background: #A9A9A9; margin-right: 10px;"></span>UNKNOWN Parameter</li>
        </ul>
    `;

    const legendContainer = document.getElementById("graphLegend");
    legendContainer.innerHTML = legend;
    legendContainer.style.display = "block";

    container.scrollIntoView({ behavior: "smooth" });
}





function generateRange(min, max, step = 1) {
    const result = [];
    for (let i = Math.ceil(min); i <= Math.floor(max); i += step) {
        result.push(i);
    }
    return result;
}






function generateCombinations(paramMap) {
    const keys = Object.keys(paramMap);
    const valueSets = keys.map(k => paramMap[k].values);

    const result = [];

    function helper(current, i) {
        if (i === valueSets.length) {
            result.push(current);
            return;
        }
        for (let val of valueSets[i]) {
            helper([...current, val], i + 1);
        }
    }

    helper([], 0);
    return result;
}




function measureComputationTime() {
    // Ensure a CSV is loaded for graph rendering
    if (!cachedCSVData) {
        alert("Please import a CSV file and run optimization first.");
        return;
    }

    const resultsContainer = document.getElementById("message");
    resultsContainer.innerHTML = ""; // Clear old results

    // Measure optimization
    const optStart = performance.now();
    parameterOptimize(); // your existing optimization logic
    const optEnd = performance.now();
    const optTime = (optEnd - optStart).toFixed(2);

    // Measure graph rendering
    const graphStart = performance.now();
    const checkboxes = document.querySelectorAll('#graphSelector input[type="checkbox"]:checked');
    const selectedReqs = Array.from(checkboxes).map(cb => cb.value);
    if (selectedReqs.length > 0) {
        drawGraphFromCSV(cachedCSVData, selectedReqs);
    }
    const graphEnd = performance.now();
    const graphTime = (graphEnd - graphStart).toFixed(2);

    // Display results
    resultsContainer.innerHTML = `
        <p><strong>Computation Time:</strong></p>
        <ul>
            <li>Optimization Time: ${optTime} ms</li>
            <li>Graph Rendering Time: ${graphTime} ms</li>
        </ul>
    `;
}
