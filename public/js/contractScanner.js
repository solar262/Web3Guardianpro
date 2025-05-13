// filepath: c:\Projects\Web3GuardianProject\Web3Guardian\public\js\contractScanner.js
// Enhanced Contract Scanner Implementation with Blockchain Integration
// This script adds comprehensive functionality to the contract scanner form
// Integrates advanced detection logic from smart-contract-audit-tool-2

// Import dependencies
import { ContractAnalyzer } from '../../src/utils/contractAnalyzer.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Web3 Security Pro Scanner with Enhanced Detection...');
    
    // Initialize contract scanner
    initContractScanner();
    
    // Set up sample code loading
    initSampleCodeLoader();
    
    // Check authentication status and update UI
    updateAuthenticationUI();
});

/**
 * Initialize the main contract scanner functionality
 */
function initContractScanner() {
    const scanForm = document.getElementById('contract-scan-form');
    if (!scanForm) return;
    
    // Pre-check all scan options by default
    document.querySelectorAll('#contract-scan-form input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    scanForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get contract code
        const contractTextarea = document.querySelector('#contract-scan-form textarea');
        const contractCode = contractTextarea.value;
        
        // Validate input
        if (!contractCode.trim()) {
            showError('Please enter smart contract code to scan');
            return;
        }
        
        // Get contract name if available
        const contractNameInput = document.querySelector('#contract-name');
        const contractName = contractNameInput ? contractNameInput.value : 'Untitled Contract';
        
        // Get scan options
        const scanOptions = {
            reentrancy: document.querySelector('input[name="opt-reentrancy"]')?.checked || false,
            uncheckedCalls: document.querySelector('input[name="opt-unchecked-calls"]')?.checked || false,
            integerOverflow: document.querySelector('input[name="opt-integer-overflow"]')?.checked || false,
            accessControl: document.querySelector('input[name="opt-access-control"]')?.checked || false,
            gasOptimization: document.querySelector('input[name="opt-gas-optimization"]')?.checked || false,
            contractName: contractName
        };
        
        // Show loading state
        const resultSection = document.getElementById('scan-results');
        resultSection.innerHTML = `
            <div class="animate-pulse p-6">
                <div class="text-xl font-semibold mb-4">Analyzing contract with enhanced detection...</div>
                <div class="h-4 bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
                <div class="h-4 bg-gray-700 rounded mb-2 w-1/2"></div>
            </div>
        `;
        resultSection.classList.remove('hidden');
        
        // Track the analysis event
        if (window.Analytics) {
            window.Analytics.trackEvent('contract_analysis_started', { 
                codeLength: contractCode.length, 
                options: JSON.stringify(scanOptions)
            });
        }
        
        try {
            // Perform analysis with enhanced analyzer
            const results = await ContractAnalyzer.analyzeCode(contractCode, scanOptions);
            
            // Display results
            displayResults(resultSection, results);
            
            // Track completion
            if (window.Analytics) {
                window.Analytics.trackEvent('contract_analysis_completed', {
                    securityScore: results.securityScore,
                    vulnerabilityCount: results.vulnerabilities.length,
                    contractName: contractName
                });
            }
        } catch (error) {
            console.error('Analysis error:', error);
            
            // Display error
            resultSection.innerHTML = `
                <div class="p-6 bg-red-900/30 border border-red-700 rounded-lg">
                    <div class="text-red-400 text-xl font-semibold mb-2">Error analyzing contract</div>
                    <div class="text-sm text-gray-300">${error.message}</div>
                </div>
            `;
            
            // Track error
            if (window.Analytics) {
                window.Analytics.trackEvent('contract_analysis_error', { 
                    error: error.message
                });
            }
        }
    });
}

/**
 * Initialize the sample code loader functionality
 */
function initSampleCodeLoader() {
    const loadSampleButton = document.getElementById('load-sample-button');
    if (!loadSampleButton) return;
    
    loadSampleButton.addEventListener('click', async function() {
        try {
            const response = await fetch('/public/samples/TokenSwap.sol');
            
            if (!response.ok) {
                throw new Error('Failed to load sample code');
            }
            
            const sampleCode = await response.text();
            const contractTextarea = document.querySelector('#contract-scan-form textarea');
            if (contractTextarea) {
                contractTextarea.value = sampleCode;
            }
            
            const contractNameInput = document.querySelector('#contract-name');
            if (contractNameInput) {
                contractNameInput.value = 'TokenSwap.sol';
            }
            
            // Track the sample loading
            if (window.Analytics) {
                window.Analytics.trackEvent('sample_contract_loaded');
            }
        } catch (error) {
            console.error('Error loading sample code:', error);
            showError('Failed to load sample code: ' + error.message);
        }
    });
}

/**
 * Check authentication status and update UI
 */
function updateAuthenticationUI() {
    const authStatus = document.getElementById('auth-status');
    if (!authStatus) return;
    
    if (window.Auth && window.Auth.isAuthenticated()) {
        const user = window.Auth.getUserInfo();
        const subscription = window.Auth.getSubscription();
        
        authStatus.innerHTML = `
            <div class="flex items-center justify-between p-2 bg-green-900/30 border border-green-700 rounded">
                <div>
                    <span class="font-medium">${user.name}</span>
                    <span class="text-sm text-gray-300 ml-2">${subscription?.plan || 'Free'} Plan</span>
                </div>
                <button id="logout-button" class="text-sm px-2 py-1 bg-red-800 rounded hover:bg-red-700">
                    Logout
                </button>
            </div>
        `;
        
        // Add logout handler
        document.getElementById('logout-button').addEventListener('click', function() {
            window.Auth.logout();
            window.location.reload();
        });
    } else {
        authStatus.innerHTML = `
            <div class="flex items-center justify-between p-2 bg-gray-800 border border-gray-700 rounded">
                <span class="text-gray-300">Guest User</span>
                <div>
                    <button id="login-button" class="text-sm px-2 py-1 bg-blue-800 rounded hover:bg-blue-700 mr-2">
                        Login
                    </button>
                    <button id="signup-button" class="text-sm px-2 py-1 bg-green-800 rounded hover:bg-green-700">
                        Sign Up
                    </button>
                </div>
            </div>
        `;
        
        // Add auth handlers
        document.getElementById('login-button').addEventListener('click', showLoginForm);
        document.getElementById('signup-button').addEventListener('click', showSignupForm);
    }
}

/**
 * Display analysis results in the result section
 * @param {HTMLElement} container - Result container element
 * @param {Object} results - Analysis results
 */
function displayResults(container, results) {
    const { vulnerabilities, optimizations, securityScore, timestamp } = results;
    
    // Create the score indicator
    const scoreClass = securityScore > 80 ? 'text-green-500' : 
                      securityScore > 60 ? 'text-yellow-500' : 'text-red-500';
    
    // Format timestamp
    const formattedTime = new Date(timestamp).toLocaleString();
    
    // Build the results HTML
    let html = `
        <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <div class="flex flex-wrap items-start justify-between mb-6">
                <div>
                    <h3 class="text-xl font-semibold mb-1">Security Analysis Results</h3>
                    <p class="text-sm text-gray-400">Completed at ${formattedTime}</p>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold ${scoreClass}">${securityScore}</div>
                    <div class="text-sm text-gray-400">Security Score</div>
                </div>
            </div>
            
            <div class="mb-8">
                <h4 class="text-lg font-medium mb-2 flex items-center">
                    <span class="mr-2">Vulnerabilities</span>
                    <span class="px-2 py-0.5 text-sm rounded-full ${vulnerabilities.length > 0 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}">
                        ${vulnerabilities.length}
                    </span>
                </h4>
                
                ${vulnerabilities.length > 0 ? renderVulnerabilities(vulnerabilities) : `
                    <div class="p-3 bg-green-900/20 border border-green-800 rounded">
                        <p class="text-green-400">No vulnerabilities detected!</p>
                    </div>
                `}
            </div>
            
            <div class="mb-6">
                <h4 class="text-lg font-medium mb-2 flex items-center">
                    <span class="mr-2">Optimization Opportunities</span>
                    <span class="px-2 py-0.5 text-sm rounded-full bg-blue-900/50 text-blue-400">
                        ${optimizations.length}
                    </span>
                </h4>
                
                ${optimizations.length > 0 ? renderOptimizations(optimizations) : `
                    <div class="p-3 bg-gray-700/20 border border-gray-700 rounded">
                        <p class="text-gray-400">No optimization opportunities identified.</p>
                    </div>
                `}
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-700 text-center">
                <button id="download-report-button" class="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded">
                    Download Full Report
                </button>
            </div>
        </div>
    `;
    
    // Update the container
    container.innerHTML = html;
    
    // Add event listener for downloading report
    const downloadButton = document.getElementById('download-report-button');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => downloadReport(results));
    }
}

/**
 * Render vulnerabilities list
 * @param {Array} vulnerabilities - List of vulnerabilities
 * @returns {string} - HTML string
 */
function renderVulnerabilities(vulnerabilities) {
    return `
        <div class="space-y-3">
            ${vulnerabilities.map(vuln => {
                const severity = getSeverityClass(vuln.severity);
                
                return `
                    <div class="p-3 bg-gray-900/50 border border-gray-700 rounded">
                        <div class="flex items-start justify-between">
                            <div class="font-medium">${vuln.type}</div>
                            <div class="px-2 py-0.5 text-xs rounded ${severity.bg} ${severity.text}">
                                ${vuln.severity.toUpperCase()}
                            </div>
                        </div>
                        <p class="text-sm mt-2 text-gray-300">${vuln.description}</p>
                        
                        ${vuln.codeSnippet ? `
                            <div class="mt-3 text-sm">
                                <div class="text-xs text-gray-400 mb-1">Line ${vuln.lineNumber}:</div>
                                <pre class="bg-gray-950 p-2 rounded overflow-x-auto text-xs">${escapeHtml(vuln.codeSnippet)}</pre>
                            </div>
                        ` : ''}
                        
                        ${vuln.reference ? `
                            <div class="mt-2 text-xs">
                                <a href="${vuln.reference}" target="_blank" class="text-blue-400 hover:underline">
                                    Learn more about this vulnerability
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render optimizations list
 * @param {Array} optimizations - List of optimizations
 * @returns {string} - HTML string
 */
function renderOptimizations(optimizations) {
    return `
        <div class="space-y-3">
            ${optimizations.map(opt => {
                const impact = opt.impact === 'high' ? 'text-yellow-400' : 
                              opt.impact === 'medium' ? 'text-blue-400' : 'text-gray-400';
                
                return `
                    <div class="p-3 bg-gray-900/50 border border-gray-700 rounded">
                        <div class="flex items-start justify-between">
                            <div class="font-medium">${opt.type}</div>
                            <div class="text-xs ${impact}">${opt.impact} impact</div>
                        </div>
                        <p class="text-sm mt-2 text-gray-300">${opt.description}</p>
                        
                        ${opt.suggestion ? `
                            <p class="text-xs mt-2 text-green-400">Suggestion: ${opt.suggestion}</p>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Get CSS classes for severity levels
 * @param {string} severity - Severity level
 * @returns {Object} - CSS classes
 */
function getSeverityClass(severity) {
    switch (severity.toLowerCase()) {
        case 'critical':
            return {bg: 'bg-red-900/50', text: 'text-red-400'};
        case 'high':
            return {bg: 'bg-orange-900/50', text: 'text-orange-400'};
        case 'medium':
            return {bg: 'bg-yellow-900/50', text: 'text-yellow-400'};
        case 'low':
            return {bg: 'bg-blue-900/50', text: 'text-blue-400'};
        default:
            return {bg: 'bg-gray-900/50', text: 'text-gray-400'};
    }
}

/**
 * Generate and download a report
 * @param {Object} results - Analysis results
 */
function downloadReport(results) {
    const { vulnerabilities, optimizations, securityScore, timestamp } = results;
    
    // Create the report content in Markdown format
    let reportContent = `# Smart Contract Security Analysis Report

## Overview
- **Security Score:** ${securityScore}/100
- **Analysis Date:** ${new Date(timestamp).toLocaleString()}
- **Vulnerabilities Detected:** ${vulnerabilities.length}
- **Optimization Opportunities:** ${optimizations.length}

## Vulnerability Details

`;

    if (vulnerabilities.length === 0) {
        reportContent += "No vulnerabilities were detected. Great job!\n\n";
    } else {
        vulnerabilities.forEach((vuln, index) => {
            reportContent += `### ${index + 1}. ${vuln.type} (${vuln.severity.toUpperCase()})\n\n`;
            reportContent += `${vuln.description}\n\n`;
            
            if (vuln.codeSnippet) {
                reportContent += `**Line ${vuln.lineNumber}:**\n\`\`\`solidity\n${vuln.codeSnippet}\n\`\`\`\n\n`;
            }
            
            if (vuln.reference) {
                reportContent += `**Reference:** ${vuln.reference}\n\n`;
            }
        });
    }

    reportContent += `## Optimization Opportunities

`;

    if (optimizations.length === 0) {
        reportContent += "No optimization opportunities were identified.\n\n";
    } else {
        optimizations.forEach((opt, index) => {
            reportContent += `### ${index + 1}. ${opt.type} (${opt.impact} impact)\n\n`;
            reportContent += `${opt.description}\n\n`;
            
            if (opt.suggestion) {
                reportContent += `**Suggestion:** ${opt.suggestion}\n\n`;
            }
        });
    }

    reportContent += `\n---\nGenerated by Web3 Security Pro - ${new Date().toISOString().split('T')[0]}`;

    // Create a Blob with the report content
    const blob = new Blob([reportContent], {type: 'text/markdown'});
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    // Track report download
    if (window.Analytics) {
        window.Analytics.trackEvent('report_downloaded', {
            securityScore,
            vulnerabilityCount: vulnerabilities.length
        });
    }
}

/**
 * Show login form modal
 */
function showLoginForm() {
    // Implementation depends on your UI framework
    alert('Login feature will be available soon!');
}

/**
 * Show signup form modal
 */
function showSignupForm() {
    // Implementation depends on your UI framework
    alert('Sign up feature will be available soon!');
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
    // Simple error display
    const resultSection = document.getElementById('scan-results');
    if (!resultSection) return;
    
    resultSection.innerHTML = `
        <div class="p-6 bg-red-900/30 border border-red-700 rounded-lg">
            <div class="text-red-400 font-semibold mb-2">Error</div>
            <div class="text-sm">${message}</div>
        </div>
    `;
    resultSection.classList.remove('hidden');
}

/**
 * Escape HTML special characters
 * @param {string} html - HTML string
 * @returns {string} - Escaped HTML
 */
function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}
