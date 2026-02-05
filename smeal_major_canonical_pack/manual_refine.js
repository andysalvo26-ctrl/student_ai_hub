const fs = require('fs').promises;
const path = require('path');

const majorContent = {
  accounting: {
    overview: "Accountants develop and interpret financial data required for decision-making by managers, investors, regulators, and other stakeholders. To perform their functions, accountants must work with both numerical information and concepts, and they must be able to function effectively as individuals and in teams. Accountants work with people in their own specialized departments, and with users of financial information throughout their organization.",
    focusAreas: [
      "Financial data development and interpretation",
      "Numerical information and concepts",
      "Decision-making support for managers, investors, regulators, and stakeholders",
      "Financial information systems",
      "Organizational financial reporting"
    ],
    contexts: [
      "Specialized accounting departments within organizations",
      "Users of financial information throughout organizations",
      "Cross-functional collaboration with other organizational departments",
      "Regulatory and compliance environments"
    ],
    emphasis: "Accountants develop and interpret financial data required for decision-making by managers, investors, regulators, and other stakeholders, working with both numerical information and concepts while functioning effectively as individuals and in teams."
  },
  finance: {
    overview: "Finance focuses on how individuals and business organizations raise money and capital, and how those resources are allocated among competing investment and consumption opportunities. The field focuses on domestic and international financial economies and the role of financial markets and institutions key in the movement of savings and investment capital from lenders to borrowers.",
    focusAreas: [
      "Raising money and capital",
      "Resource allocation among competing investment and consumption opportunities",
      "Domestic and international financial economies",
      "Financial markets and institutions",
      "Movement of savings and investment capital from lenders to borrowers",
      "Evaluation of alternative investment and savings opportunities",
      "Financial instruments"
    ],
    contexts: [
      "Business organizations",
      "Financial markets",
      "Financial institutions",
      "Domestic and international financial economies",
      "Investment and consumption decision-making"
    ],
    emphasis: "Finance focuses on how individuals and business organizations raise money and capital, and how those resources are allocated among competing investment and consumption opportunities, examining the role of financial markets and institutions in the movement of savings and investment capital."
  },
  management: {
    overview: "The Management major provides curricular content and practical experience rooted in understanding organizations, ethics, and strategy. Through courses in the Management major, students develop self-awareness, critical thinking and problem solving, teamwork, cross-cultural communication, leadership, and social and emotional intelligence.",
    focusAreas: [
      "Understanding organizations",
      "Ethics",
      "Strategy",
      "Self-awareness",
      "Critical thinking and problem solving",
      "Teamwork",
      "Cross-cultural communication",
      "Leadership",
      "Social and emotional intelligence"
    ],
    contexts: [
      "Organizations",
      "Team environments",
      "Cross-cultural settings",
      "Strategic decision-making contexts"
    ],
    emphasis: "The Management major emphasizes understanding organizations, ethics, and strategy, developing capabilities in critical thinking, problem solving, teamwork, cross-cultural communication, and leadership."
  },
  'management-information-systems': {
    overview: "Management Information Systems focuses on technology-supported techniques for exploring, analyzing, integrating, and reporting business data to facilitate fact-based decision-making and enterprise-wide management.",
    focusAreas: [
      "Technology-supported techniques for exploring business data",
      "Business data analysis",
      "Business data integration",
      "Business data reporting",
      "Fact-based decision-making",
      "Enterprise-wide management",
      "Business analytics",
      "Systems analysis and design",
      "Core business processes"
    ],
    contexts: [
      "Enterprise-wide management contexts",
      "Business data environments",
      "Decision-making contexts",
      "Business analytics contexts",
      "Systems analysis contexts",
      "Industry, consulting, and government sectors"
    ],
    emphasis: "Management Information Systems emphasizes technology-supported techniques for exploring, analyzing, integrating, and reporting business data to facilitate fact-based decision-making and enterprise-wide management, developing proficiency in business analytics, systems analysis and design, and core business processes."
  },
  marketing: {
    overview: "Marketing is a broad field with the primary purpose of generating demand for an enterprise's products or services, involving an understanding of consumer behavior and research to determine consumer preferences and to guide firms in dealing with those preferences.",
    focusAreas: [
      "Generating demand for products or services",
      "Consumer behavior understanding",
      "Marketing research",
      "Consumer preference determination",
      "Marketing strategy",
      "Business development and sales",
      "Strategic insights and analytics"
    ],
    contexts: [
      "Enterprises",
      "Consumer markets",
      "Customer-facing roles",
      "Strategic decision-making contexts",
      "Product and brand management"
    ],
    emphasis: "Marketing emphasizes generating demand for an enterprise's products or services through understanding consumer behavior and research, determining consumer preferences, and guiding firms in dealing with those preferences."
  },
  'actuarial-science': {
    overview: "Actuarial Science applies mathematical and statistical methods to assess risk, using quantitative and qualitative skills to calculate costs and evaluate potential outcomes in insurance, consulting, finance, and government contexts.",
    focusAreas: [
      "Mathematical and statistical methods",
      "Quantitative and qualitative skills",
      "Risk assessment and calculation",
      "Cost calculation for insurance",
      "Claims evaluation",
      "Professional examination preparation"
    ],
    contexts: [
      "Insurance industry",
      "Consulting",
      "Finance",
      "Government agencies",
      "Natural disaster risk assessment",
      "Accident and claims evaluation"
    ],
    emphasis: "Actuarial Science emphasizes the application of mathematical and statistical methods to assess risk, calculating costs and evaluating potential outcomes using quantitative and qualitative skills."
  },
  'corporate-innovation-and-entrepreneurship': {
    overview: "Corporate Innovation and Entrepreneurship focuses on developing problem solving and creative thinking skills, along with the ability to spot trends, recognize opportunities, and develop plans to capitalize on high-potential ideas.",
    focusAreas: [
      "Problem solving",
      "Creative thinking",
      "Trend identification",
      "Opportunity recognition",
      "Plan development for high-potential ideas",
      "Communication across various mediums",
      "Negotiation",
      "Business planning",
      "Capital investing",
      "Goal setting",
      "Decision making"
    ],
    contexts: [
      "Small to large businesses",
      "Emerging entrepreneurial ventures",
      "Innovative management contexts",
      "New venture creation",
      "Business transformation"
    ],
    emphasis: "Corporate Innovation and Entrepreneurship emphasizes developing problem solving and creative thinking skills, recognizing opportunities, and developing plans to capitalize on high-potential ideas while being grounded in business aspects of planning, capital investing, goal setting, and decision making."
  },
  'real-estate': {
    overview: "Real Estate prepares students for professional opportunities in corporate real estate, investment and counseling, commercial real estate brokerage, appraisal, risk management, mortgage lending and banking, development, and governmental services.",
    focusAreas: [
      "Corporate real estate",
      "Investment and counseling",
      "Commercial real estate brokerage",
      "Appraisal",
      "Risk management",
      "Mortgage lending and banking",
      "Development",
      "Governmental services",
      "Real estate investment analysis"
    ],
    contexts: [
      "Corporate real estate environments",
      "Investment contexts",
      "Commercial brokerage",
      "Mortgage and construction lending",
      "Property management",
      "Production and finance contexts",
      "Financial services"
    ],
    emphasis: "Real Estate emphasizes preparing students for professional opportunities across corporate real estate, investment, brokerage, appraisal, risk management, lending, development, and governmental services, requiring quantitative and qualitative skills to assess and analyze all aspects of real estate investments."
  },
  'risk-management': {
    overview: "Risk Management addresses the wide array of risks organizations face in rapidly changing and complex business environments, examining operations disruptions from external forces like natural disasters and political risks to internal factors like faulty product design and flawed financial systems.",
    focusAreas: [
      "Enterprise risk management",
      "Risk identification and assessment",
      "Operations disruption analysis",
      "External risk factors",
      "Internal risk factors",
      "Management and control risk",
      "Legal, political, economic, and property risk assessment",
      "Strategic decision risk"
    ],
    contexts: [
      "Organizations in rapidly changing business environments",
      "Complex business environments",
      "External risk contexts",
      "Internal operational contexts",
      "Strategic decision-making contexts",
      "Financial services",
      "Government agencies"
    ],
    emphasis: "Risk Management emphasizes addressing the wide array of risks organizations face, examining operations disruptions from external and internal factors, and using enterprise risk management approaches to protect organizations from adverse consequences."
  },
  'supply-chain-information-systems': {
    overview: "Supply Chain and Information Systems is a boundary-spanning field of supply chain networks, which organizations use to acquire, produce, and deliver goods and services all over the world, focusing on core flow functions, the role of information systems as a critical enabler, and cross-functional planning perspectives.",
    focusAreas: [
      "Core flow functions: buy, make, deliver, and return",
      "Information systems as critical enabler for integrating supply chains",
      "Cross-functional planning perspectives",
      "Customer relationships",
      "Post-sales support",
      "New product design and launches",
      "Supply chain network management",
      "Acquisition, production, and delivery of goods and services"
    ],
    contexts: [
      "Global supply chain networks",
      "Organizations acquiring, producing, and delivering goods and services",
      "Cross-functional contexts",
      "Customer relationship contexts",
      "Post-sales support environments",
      "New product development contexts",
      "Services sector",
      "Manufacturing sector"
    ],
    emphasis: "Supply Chain and Information Systems emphasizes the boundary-spanning nature of supply chain networks, focusing on core flow functions, the role of information systems as a critical enabler for integration, and cross-functional planning perspectives that span core functions, customer relationships, post-sales support, and new product design."
  }
};

async function manualRefine() {
  const fetchedContent = JSON.parse(
    await fs.readFile(path.join(__dirname, 'fetched_content.json'), 'utf8')
  );

  for (const [majorName, content] of Object.entries(majorContent)) {
    const data = fetchedContent[majorName];
    if (!data || data.error) continue;
    
    const filename = `MAJOR_${majorName.replace(/-/g, '_').toUpperCase()}.md`;
    const filepath = path.join(__dirname, filename);
    
    const markdown = formatMajorMarkdown(content, data.url);
    await fs.writeFile(filepath, markdown, 'utf8');
    console.log(`✓ Refined ${filename}`);
  }
}

function formatMajorMarkdown(content, url) {
  return `${content.overview}

## Core Focus Areas

${content.focusAreas.map(area => `- ${area}`).join('\n')}

## Common Contexts and Domains

${content.contexts.map(ctx => `- ${ctx}`).join('\n')}

## Disciplinary Emphasis

${content.emphasis}

---
*Source: ${url}*
`;
}

if (require.main === module) {
  manualRefine().catch(console.error);
}

module.exports = { manualRefine };
