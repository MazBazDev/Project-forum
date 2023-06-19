import React, { useState } from "react";
import Select from "react-select";

export default function Filters({ locatedTopics, setLocatedTopics }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (selectedOption) => {
    setSelectedOption(selectedOption);

    if (selectedOption) {
      switch (selectedOption.value) {
        case "alphabetical":
          sortTopicsAlphabetically();
          break;
        case "reverseAlphabetical":
          sortTopicsReverseAlphabetically();
          break;
        case "ascendingCount":
          sortTopicsByAscendingCount();
          break;
        case "descendingCount":
          sortTopicsByDescendingCount();
          break;
        default:
          break;
      }
    }
  };

  const sortTopicsAlphabetically = () => {
    const sortedTopics = locatedTopics.slice().sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    setLocatedTopics(sortedTopics);
  };

  const sortTopicsReverseAlphabetically = () => {
    const sortedTopics = locatedTopics.slice().sort((a, b) =>
      b.title.localeCompare(a.title)
    );
    setLocatedTopics(sortedTopics);
  };

  const sortTopicsByAscendingCount = () => {
    const sortedTopics = [...locatedTopics].sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );
    setLocatedTopics(sortedTopics);
  };
  
  const sortTopicsByDescendingCount = () => {
    const sortedTopics = [...locatedTopics].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );
    setLocatedTopics(sortedTopics);
  };
  
  const options = [
    { value: "alphabetical", label: "Alphabetical" },
    { value: "reverseAlphabetical", label: "Reverse alphabetical" },
    { value: "ascendingCount", label: "Oldest to newest" },
    { value: "descendingCount", label: "Newest to oldest" }

  ];

  return (
    <div>
      <label htmlFor="">Filters</label>
      <Select
        value={selectedOption}
        options={options}
        onChange={handleOptionChange}
      />
    </div>
  );
}
