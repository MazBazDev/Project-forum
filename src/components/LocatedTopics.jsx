import React from "react";
import axios from "axios";
import Topic from "./Topic";

class LocatedTopics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [], // Tableau vide pour stocker les sujets
    };
  }

  componentDidMount() {
    this.getTopics();
  }

  getTopics() {
    axios
      .get("http://localhost:8080/api/posts")
      .then((response) => {
        this.setState({ topics: response.data.posts }); // Mettre à jour l'état avec les sujets récupérés
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    let { topics } = this.state; // Récupérer les sujets depuis l'état local
    if (topics == null) {
      topics = <h2>Any topics !</h2>
    } else {
      topics = topics.map((topic) => (
        <Topic topic={topic} />
      ))
    }

    return (
      <div>
        {topics}
      </div>
    );
  }
}

export default LocatedTopics;
