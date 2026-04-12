const simplifyCategory = (category) => {
  if (!category) return "Other";

  const cat = category.toLowerCase();

  if (cat.includes("equity") || cat.includes("growth")) return "equity";
  if (cat.includes("debt") || cat.includes("income") || cat.includes("liquid"))
    return "debt";
  if (cat.includes("hybrid") || cat.includes("balanced")) return "hybrid";
  if (cat.includes("index") || cat.includes("etf")) return "index";
  if (cat.includes("tax") || cat.includes("elss")) return "tax-saving";

  return "other";
};

module.exports = { simplifyCategory };
