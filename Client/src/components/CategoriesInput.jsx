import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import Cookies from "js-cookie";
import Notiflix from "notiflix";

export default function CategoriesInput({ selectedCategories, onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    queryOptions();
  }, []);

  useEffect(() => {
    restoreSelectedOptions();
  }, [options]);

  function queryOptions() {
    axios.get("http://localhost:8080/api/categories").then((response) => {
      if (response.data != null) {
        const formatted = response.data.map((element) => ({
          value: element.id,
          label: element.title,
        }));
        setOptions(formatted);
      }
    });
  }

  function createCategory(newCategory) {
    Notiflix.Confirm.show(
      "Create category?",
      `Do you want to create ${newCategory}`,
      "Yes",
      "No",
      function okCb() {
        axios
          .post(
            "http://localhost:8080/api/categories/create",
            {
              title: newCategory,
            },
            { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
          )
          .then((response) => {
            const createdCategoryId = response.data.id;
            const createdCategoryOption = {
              value: createdCategoryId,
              label: newCategory,
            };
            onChange([...selectedCategories, createdCategoryOption]);
            setOptions([...options, createdCategoryOption]);

            Notiflix.Notify.success("Category created!");
          })
          .catch((error) => {
            console.error("Error creating category:", error);
          });
      },
      function cancelCb() {
        Notiflix.Notify.info("Category creation canceled!");
      },
      {}
    );
  }

  function restoreSelectedOptions() {
    const restoredSelectedOptions = selectedCategories.filter((selectedOption) =>
      options.some((option) => option.value === selectedOption.value)
    );
    onChange(restoredSelectedOptions);
  }

  const handleSelectChange = (selectedValues) => {
    onChange(selectedValues);
  };

  return (
    <CreatableSelect
      isClearable
      isMulti
      name="categories"
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      onCreateOption={createCategory}
      onChange={handleSelectChange}
      value={selectedCategories}
      getOptionValue={(option) => option.value}
      getOptionLabel={(option) => option.label}
    />
  );
}
