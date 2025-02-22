const { Schema, model } = require("mongoose");

const defaultLabels = {
  en: {
    manufacturer: "Manufacturer",
    sleepingAreaWidth: "Bed width",
    liftMechanism: "Availability of a lifting mechanism",
    frameMaterial: "Frame material",
    bedFeatures: "Features of the beds",
    transformationMechanism: "Transformation mechanism",
    fillingType: "Replenishment type",
    armrests: "Availability of armrests",
    drawers: "Availability of boxes",
    mattressLenght: "Length of the mattress",
    mattressHeight: "Mattress height",
    stiffnessLevel: "Stiffness level",
    maximumLoad: "Maximum load",
  },
  ua: {
    manufacturer: "Виробник",
    sleepingAreaWidth: "Ширина спального місця",
    liftMechanism: "Наявність підйомного механізму",
    frameMaterial: "Матеріал каркасу",
    bedFeatures: "Особливості ліжок",
    transformationMechanism: "Механізм трансформації",
    fillingType: "Тип наповнення",
    armrests: "Наявність підлокітників",
    drawers: "Наявність ящиків",
    mattressLenght: "Довжина матраца",
    mattressHeight: "Висота матраца",
    stiffnessLevel: "Рівень жорсткості",
    maximumLoad: "Максимальна нагрузка",
  },
};

const ProductSchema = new Schema({
  price: { type: Number, required: true },
  productCode: { type: String, required: true, unique: true },
  images: { type: [String], required: true },
  name: {
    value: { type: String },
    translations: {
      en: { value: { type: String } },
      ua: { value: { type: String } },
    },
  },
  category: {
    value: { type: String },
    translations: {
      en: { value: { type: String } },
      ua: { value: { type: String } },
    },
  },
  subcategory: {
    value: { type: String },
    translations: {
      en: { value: { type: String } },
      ua: { value: { type: String } },
    },
  },
  filterParams: {
    // all

    manufacturer: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.manufacturer },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.manufacturer },
        },
      },
    },
    sleepingAreaWidth: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.sleepingAreaWidth },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.sleepingAreaWidth },
        },
      },
    },

    // beds
    liftMechanism: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.liftMechanism },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.liftMechanism },
        },
      },
    },

    frameMaterial: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.frameMaterial },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.frameMaterial },
        },
      },
    },
    bedFeatures: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.bedFeatures },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.bedFeatures },
        },
      },
    },

    // sofa and chairs
    transformationMechanism: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: {
            type: String,
            default: defaultLabels.en.transformationMechanism,
          },
        },
        ua: {
          value: { type: String },
          label: {
            type: String,
            default: defaultLabels.ua.transformationMechanism,
          },
        },
      },
    },
    fillingType: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.fillingType },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.fillingType },
        },
      },
    },
    armrests: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.armrests },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.armrests },
        },
      },
    },
    drawers: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.drawers },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.drawers },
        },
      },
    },
    //mattress
    mattressLenght: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.mattressLenght },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.mattressLenght },
        },
      },
    },
    stiffnessLevel: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.stiffnessLevel },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.stiffnessLevel },
        },
      },
    },
    mattressHeight: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.mattressHeight },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.mattressHeight },
        },
      },
    },
    maximumLoad: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
          label: { type: String, default: defaultLabels.en.maximumLoad },
        },
        ua: {
          value: { type: String },
          label: { type: String, default: defaultLabels.ua.maximumLoad },
        },
      },
    },
  },

  additionalInfo: {
    //all

    size: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
        },
        ua: {
          value: { type: String },
        },
      },
    },
    avaliability: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
        },
        ua: {
          value: { type: String },
        },
      },
    },
    warranty: {
      value: { type: String },
      translations: {
        en: {
          value: { type: String },
        },
        ua: {
          value: { type: String },
        },
      },
    },
  },
  options: {
    textile: {
      label: {
        en: {
          value: { type: String },
        },
        ua: {
          value: { type: String },
        },
      },
      items: [
        {
          additionalPrice: { type: Number },
          value: { type: String },
          translations: {
            en: {
              value: { type: String },
            },
            ua: {
              value: { type: String },
            },
          },
        },
      ],
    },
    color: {
      label: {
        en: {
          value: { type: String },
        },
        ua: {
          value: { type: String },
        },
      },
      items: [
        {
          additionalPrice: { type: Number },
          value: { type: String },
          translations: {
            en: {
              value: { type: String },
            },
            ua: {
              value: { type: String },
            },
          },
        },
      ],
    },
    bedLegs: {
      label: {
        en: {
          value: { type: String },
        },
        ua: {
          value: { type: String },
        },
      },
      items: [
        {
          value: { type: String },
          additionalPrice: { type: Number },
          translations: {
            en: {
              value: { type: String },
            },
            ua: {
              value: { type: String },
            },
          },
        },
      ],
    },
  },
});

ProductSchema.pre("save", function (next) {
  const additionalInfoKeys = Object.keys(this.additionalInfo);

  additionalInfoKeys.forEach((key) => {
    const valuePath = `additionalInfo.${key}.value`;
    const valueTPath = `additionalInfo.${key}.translations.en.value`;

    if (this.additionalInfo[key] && this.isModified(valuePath)) {
      this.set(valueTPath, this.get(valuePath), { strict: false });
    }
  });

  const fields = ["name", "category", "subcategory"];

  fields.forEach((field) => {
    const valuePath = `${field}.value`;
    const valueTPath = `${field}.translations.en.value`;

    if (this[field] && this.isModified(valuePath)) {
      this.set(valueTPath, this.get(valuePath), { strict: false });
    }
  });

  const filterParamsKeys = Object.keys(this.filterParams);
  filterParamsKeys.forEach((key) => {
    const valuePath = `filterParams.${key}.value`;
    const valueTPath = `filterParams.${key}.translations.en.value`;

    if (this.filterParams[key] && this.isModified(valuePath)) {
      this.set(valueTPath, this.get(valuePath), { strict: false });
    }
  });

  next();
});

module.exports = model("Product", ProductSchema);
