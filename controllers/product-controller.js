const e = require("express");
const { parseFilterParams } = require("../helpers/parseFilterParams");
const ProductModel = require("../models/product-model");

class ProductController {
  async addItem(req, res, next) {
    try {
      const newProduct = await ProductModel.create({ ...req.body });
      return res.json(newProduct);
    } catch (e) {
      next(e);
    }
  }

  async getAllProducts(req, res, next) {
    try {
      const products = await ProductModel.find();
      return res.json(products);
    } catch (e) {
      next(e);
    }
  }

  async getGoodies(req, res, next) {
    let gt;
    let lt;
    let sort;
    let page = 1;
    let productsResult;
    let filtersResult;
    let maxPage;
    let minPrice;
    let maxPrice;
    let totalCount;
    const PER_PAGE = 9;
    async function getProducts() {
      const parsedParams = parseFilterParams(req.query.filterParams);
      function convertFiltersToArray(filters) {
        return Object.entries(filters)
          .map(([key, values]) => {
            if (values) {
              if (key === "sort") {
                if (Array.isArray(values)) {
                  sort = values[0];
                } else {
                  sort = values;
                }
                return;
              }
              if (key === "page") {
                if (Array.isArray(values)) {
                  page = Number(values[0]);
                } else {
                  page = Number(values);
                }
              }
              if (key === "gt") {
                if (Array.isArray(values)) {
                  gt = { $gt: Number(Math.max(...values)) - 1 };
                } else {
                  gt = { $gt: values - 1 };
                }
                return;
              }
              if (key === "lt") {
                if (Array.isArray(values)) {
                  lt = { $lt: Number(Math.min(...values)) + 1 };
                } else {
                  lt = { $lt: Number(values) + 1 };
                }
                return;
              }
              if (Array.isArray(values)) {
                return {
                  key,
                  values,
                };
              } else {
                return {
                  key,
                  values: [values],
                };
              }
            }
          })
          .filter(Boolean);
      }

      const filters = convertFiltersToArray(parsedParams);

      const distinctAdditionalInfo = await ProductModel.distinct(
        "filterParams"
      );

      const allKeys = distinctAdditionalInfo.reduce((keys, additionalInfo) => {
        const infoKeys = Object.keys(additionalInfo);
        infoKeys.forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
          }
        });
        return keys;
      }, []);

      const orConditions = [];

      filters.forEach((filter) => {
        const andConditions = [];

        filter.values.forEach((value) => {
          if (allKeys.includes(filter.key)) {
            const condition = {};

            condition[`filterParams.${filter.key}.value`] = value;
            andConditions.push(condition);
          }
        });
        if (andConditions.length > 0) {
          orConditions.push({ $or: andConditions });
        }
      });
      if (gt && lt) {
        orConditions.push({ price: gt });
        orConditions.push({ price: lt });
      }
      if (!lt && gt) {
        orConditions.push({ price: gt });
      }
      if (lt && !gt) {
        orConditions.push({ price: lt });
      }
      if (req.query.category) {
        orConditions.push({ ["category.value"]: req.query.category });
      }

      if (req.query.subcategory) {
        orConditions.push({ ["subcategory.value"]: req.query.subcategory });
      }

      let countQuery;
      if (orConditions.length === 0) {
        countQuery = ProductModel.find().countDocuments();
      } else {
        countQuery = ProductModel.find({ $and: orConditions }).countDocuments();
      }

      totalCount = await countQuery;
      maxPage = Math.ceil(totalCount / PER_PAGE);

      let productsQuery;
      if (orConditions.length === 0) {
        productsQuery = ProductModel.find();
      } else {
        productsQuery = ProductModel.find({ $and: orConditions });
      }
      if (sort) {
        switch (sort) {
          case "price-asc":
            productsQuery.sort({ price: 1 });
            break;
          case "price-desc":
            productsQuery.sort({ price: -1 });
            break;
        }
      } else {
        productsQuery.sort({});
      }
      const startIndex = (page - 1) * PER_PAGE;
      productsResult = await productsQuery.skip(startIndex).limit(PER_PAGE);
    }

    async function getFilters() {
      const parsedParams = parseFilterParams(req.query.filterParams);
      function convertFiltersToArray(filters) {
        return Object.entries(filters)
          .map(([key, values]) => {
            if (values) {
              if (key === "sort") {
                return;
              }
              if (key === "page") {
                return;
              }
              let uniqueValues = Array.isArray(values)
                ? [...new Set(values)]
                : [values];
              return {
                key,
                values: uniqueValues,
              };
            }
          })
          .filter(Boolean);
      }

      const filters = convertFiltersToArray(parsedParams);

      ///////////////////////////////////////////////////////////////////////////////////////

      const distinctAdditionalInfo = await ProductModel.distinct(
        "filterParams"
      );

      const allKeys = distinctAdditionalInfo.reduce((keys, additionalInfo) => {
        const infoKeys = Object.keys(additionalInfo);
        infoKeys.forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
          }
        });
        return keys;
      }, []);

      ///// //////////////////////////////////////////////////////////////////////////////////
      const all = await ProductModel.find({
        "category.value": req.query.category,
      });

      maxPrice = Math.max(...all.map((product) => product.price));
      minPrice = Math.min(...all.map((product) => product.price));

      let results = [];
      // Object to store translations for each key
      for (const category of allKeys) {
        let query = {};
        filters.forEach((filter) => {
          if (allKeys.includes(filter.key)) {
            if (category === filter.key && filter.values.length > 0) {
              query[`filterParams.${filter.key}.value`] = {
                $nin: filter.values,
              };
            } else {
              query[`filterParams.${filter.key}.value`] = {
                $in: filter.values,
              };
            }
          }
        });

        if (req.query.category) {
          query["category.value"] = req.query.category;
        }

        if (req.query.subcategory) {
          query["subcategory.value"] = req.query.subcategory;
        }
        ///////////////////////////////////////////////////////////////////////////////////////
        const temp = await ProductModel.find(query);

        let translations = all.reduce((trans, item) => {
          const value = item.filterParams[category].value;
          if (!trans[value]) {
            trans[value] = item.filterParams[category].translations;
          }
          return trans;
        }, {});

        const valueCounts = temp.reduce((counts, item) => {
          if (item.filterParams[category].value !== undefined) {
            const value = item.filterParams[category].value;
            counts[value] = (counts[value] || 0) + 1;
          }
          return counts;
        }, {});

        // Map values to objects with count
        const valuesWithCount = Object.keys(valueCounts).map((value) => {
          return {
            filterKey: value,
            count: valueCounts[value],
            translations: translations[value],
            isActive: false,
          };
        });

        const filterValues =
          filters.find((filter) => filter.key === category)?.values || [];

        const filteredValuesWithCount = valuesWithCount.filter(
          (item) => !filterValues.includes(item.filterKey)
        );

        const activeFilterTranslations = filterValues
          .map((value) => {
            if (translations[value]) {
              return {
                filterKey: value,
                translations: translations[value],
                isActive: true,
              };
            } else {
              return;
            }
          })
          .filter(Boolean);

        results.push({
          key: category,
          values: [...activeFilterTranslations, ...filteredValuesWithCount],
        });
      }
      filtersResult = results.filter((item) => item.values.length > 0);
      filtersResult.forEach((item) => {
        item.values.sort((a, b) => {
          return a.filterKey > b.filterKey ? 1 : -1;
        });
      });

      // filtersResult.forEach(item=> {
      //   item.
      // })
    }

    try {
      await getProducts();
      await getFilters();
      filtersResult.sort();

      res.json({
        products: productsResult,
        filters: filtersResult,
        maxPage,
        minPrice,
        maxPrice,
        count: totalCount,
      });
    } catch (error) {
      next(error);
    }
  }

  // async getAllFilters(req, res, next) {
  //   try {
  //     const parsedParams = parseFilterParams(req.query.filterParams);
  //     function convertFiltersToArray(filters) {
  //       return Object.entries(filters)
  //         .map(([key, values]) => {
  //           if (values) {
  //             if (key === "sort") {
  //               return;
  //             }
  //             if (key === "page") {
  //               return;
  //             }
  //             let uniqueValues = Array.isArray(values)
  //               ? [...new Set(values)]
  //               : [values];
  //             return {
  //               key,
  //               values: uniqueValues,
  //             };
  //           }
  //         })
  //         .filter(Boolean);
  //     }

  //     const filters = convertFiltersToArray(parsedParams);

  //     ///////////////////////////////////////////////////////////////////////////////////////

  //     const distinctAdditionalInfo = await ProductModel.distinct(
  //       "filterParams"
  //     );

  //     const allKeys = distinctAdditionalInfo.reduce((keys, additionalInfo) => {
  //       const infoKeys = Object.keys(additionalInfo);
  //       infoKeys.forEach((key) => {
  //         if (!keys.includes(key)) {
  //           keys.push(key);
  //         }
  //       });
  //       return keys;
  //     }, []);

  //     ///// //////////////////////////////////////////////////////////////////////////////////
  //     const all = await ProductModel.find({
  //       "category.value": req.query.category,
  //     });

  //     const maxPrice = Math.max(...all.map((product) => product.price));
  //     const minPrice = Math.min(...all.map((product) => product.price));

  //     let results = [];
  //     // Object to store translations for each key
  //     for (const category of allKeys) {
  //       let query = {};
  //       filters.forEach((filter) => {
  //         if (allKeys.includes(filter.key)) {
  //           if (category === filter.key && filter.values.length > 0) {
  //             query[`filterParams.${filter.key}.value`] = {
  //               $nin: filter.values,
  //             };
  //           } else {
  //             query[`filterParams.${filter.key}.value`] = {
  //               $in: filter.values,
  //             };
  //           }
  //         }
  //       });

  //       if (req.query.category) {
  //         query["category.value"] = req.query.category;
  //       }

  //       if (req.query.subcategory) {
  //         query["subcategory.value"] = req.query.subcategory;
  //       }
  //       ///////////////////////////////////////////////////////////////////////////////////////
  //       const temp = await ProductModel.find(query);

  //       let translations = all.reduce((trans, item) => {
  //         const value = item.filterParams[category].value;
  //         if (!trans[value]) {
  //           trans[value] = item.filterParams[category].translations;
  //         }
  //         return trans;
  //       }, {});

  //       const valueCounts = temp.reduce((counts, item) => {
  //         if (item.filterParams[category].value !== undefined) {
  //           const value = item.filterParams[category].value;
  //           counts[value] = (counts[value] || 0) + 1;
  //         }
  //         return counts;
  //       }, {});

  //       // Map values to objects with count
  //       const valuesWithCount = Object.keys(valueCounts).map((value) => {
  //         return {
  //           filterKey: value,
  //           count: valueCounts[value],
  //           translations: translations[value],
  //         };
  //       });

  //       const filterValues =
  //         filters.find((filter) => filter.key === category)?.values || [];

  //       const filteredValuesWithCount = valuesWithCount.filter(
  //         (item) => !filterValues.includes(item.filterKey)
  //       );

  //       const activeFilterTranslations = filterValues
  //         .map((value) => {
  //           if (translations[value]) {
  //             return {
  //               filterKey: value,
  //               translations: translations[value],
  //             };
  //           } else {
  //             return;
  //           }
  //         })
  //         .filter(Boolean);

  //       results.push({
  //         key: category,
  //         values: [...activeFilterTranslations, ...filteredValuesWithCount],
  //       });
  //     }
  //     const filteredResults = results.filter((item) => item.values.length > 0);

  //     return res.json({ filteredResults, maxPrice, minPrice });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // }

  async getSingleProduct(req, res, next) {
    try {
      const { productCode } = req.query;
      const product = await ProductModel.find({ productCode });
      return res.json(product[0]);
    } catch (e) {
      next(e);
    }
  }

  async getSubcategories(req, res, next) {
    try {
      const { category } = req.query;

      const result = await ProductModel.aggregate([
        { $match: { "category.value": category } },
        {
          $group: {
            _id: "$subcategory.value",
            subcategory: { $first: "$subcategory" },
          },
        },
        {
          $replaceRoot: { newRoot: "$subcategory" },
        },
      ]);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  // async getFilteredProducts(req, res, next) {
  //   try {
  //     let gt;
  //     let lt;
  //     let sort;
  //     let page = 1;
  //     const PER_PAGE = 2;

  //     const parsedParams = parseFilterParams(req.query.filterParams);
  //     function convertFiltersToArray(filters) {
  //       return Object.entries(filters)
  //         .map(([key, values]) => {
  //           if (values) {
  //             if (key === "sort") {
  //               if (Array.isArray(values)) {
  //                 sort = values[0];
  //               } else {
  //                 sort = values;
  //               }
  //               return;
  //             }
  //             if (key === "page") {
  //               console.log(values);
  //               if (Array.isArray(values)) {
  //                 page = Number(values[0]);
  //               } else {
  //                 page = Number(values);
  //               }
  //             }
  //             if (key === "gt") {
  //               if (Array.isArray(values)) {
  //                 gt = { $gt: Number(Math.max(...values)) - 1 };
  //               } else {
  //                 gt = { $gt: values - 1 };
  //               }
  //               return;
  //             }
  //             if (key === "lt") {
  //               if (Array.isArray(values)) {
  //                 lt = { $lt: Number(Math.min(...values)) + 1 };
  //               } else {
  //                 lt = { $lt: Number(values) + 1 };
  //               }
  //               return;
  //             }
  //             if (Array.isArray(values)) {
  //               return {
  //                 key,
  //                 values,
  //               };
  //             } else {
  //               return {
  //                 key,
  //                 values: [values],
  //               };
  //             }
  //           }
  //         })
  //         .filter(Boolean);
  //     }

  //     const filters = convertFiltersToArray(parsedParams);

  //     const distinctAdditionalInfo = await ProductModel.distinct(
  //       "filterParams"
  //     );

  //     const allKeys = distinctAdditionalInfo.reduce((keys, additionalInfo) => {
  //       const infoKeys = Object.keys(additionalInfo);
  //       infoKeys.forEach((key) => {
  //         if (!keys.includes(key)) {
  //           keys.push(key);
  //         }
  //       });
  //       return keys;
  //     }, []);

  //     const orConditions = [];

  //     filters.forEach((filter) => {
  //       const andConditions = [];

  //       filter.values.forEach((value) => {
  //         if (allKeys.includes(filter.key)) {
  //           const condition = {};

  //           condition[`filterParams.${filter.key}.value`] = value;
  //           andConditions.push(condition);
  //         }
  //       });
  //       if (andConditions.length > 0) {
  //         orConditions.push({ $or: andConditions });
  //       }
  //     });
  //     if (gt && lt) {
  //       orConditions.push({ price: gt });
  //       orConditions.push({ price: lt });
  //     }
  //     if (!lt && gt) {
  //       orConditions.push({ price: gt });
  //     }
  //     if (lt && !gt) {
  //       orConditions.push({ price: lt });
  //     }
  //     if (req.query.category) {
  //       orConditions.push({ ["category.value"]: req.query.category });
  //     }

  //     if (req.query.subcategory) {
  //       orConditions.push({ ["subcategory.value"]: req.query.subcategory });
  //     }

  //     let countQuery;
  //     if (orConditions.length === 0) {
  //       countQuery = ProductModel.find().countDocuments();
  //     } else {
  //       countQuery = ProductModel.find({ $and: orConditions }).countDocuments();
  //     }

  //     const totalCount = await countQuery;
  //     const maxPage = Math.ceil(totalCount / PER_PAGE);

  //     let productsQuery;
  //     if (orConditions.length === 0) {
  //       productsQuery = ProductModel.find();
  //     } else {
  //       productsQuery = ProductModel.find({ $and: orConditions });
  //     }
  //     if (sort) {
  //       switch (sort) {
  //         case "price-asc":
  //           productsQuery.sort({ price: 1 });
  //           break;
  //         case "price-desc":
  //           productsQuery.sort({ price: -1 });
  //           break;
  //       }
  //     }
  //     const startIndex = (page - 1) * PER_PAGE;
  //     const data = await productsQuery.skip(startIndex).limit(PER_PAGE);
  //     return res.json({ data, maxPage });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async getProductsByName(req, res, next) {
    try {
      const PER_PAGE = 10;
      const { search, page = 1, sort } = req.query;

      let searchQuery;
      let countQuery;
      if (search && search.length > 0) {
        searchQuery = ProductModel.find({
          $or: [
            { "name.translations.en.value": new RegExp(search, "i") },
            { "name.translations.ua.value": new RegExp(search, "i") },
          ],
        });
        countQuery = ProductModel.find({
          $or: [
            { "name.translations.en.value": new RegExp(search, "i") },
            { "name.translations.ua.value": new RegExp(search, "i") },
          ],
        });
      } else {
        searchQuery = ProductModel.find();
        countQuery = ProductModel.find();
      }
      if (sort) {
        switch (sort) {
          case "price-asc":
            searchQuery.sort({ price: 1 });
            break;
          case "price-desc":
            searchQuery.sort({ price: -1 });
            break;
        }
      } else {
        searchQuery.sort({});
      }
      const startIndex = (page - 1) * PER_PAGE;
      const totalCount = await countQuery.countDocuments();
      const maxPage = Math.ceil(totalCount / PER_PAGE);
      const data = await searchQuery.skip(startIndex).limit(PER_PAGE).exec();

      return res.json({ data, count: totalCount, maxPage });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ProductController();
