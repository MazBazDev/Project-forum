import React from "react";
import moment from "moment";

class Topic extends React.Component {
  render() {
    const { topic } = this.props;
    const timeAgo = moment(topic.created_at).fromNow(); // Convertir la date en format "x days ago"

    return (
        <>
            <hr  style={{
                color: '#000000',
                backgroundColor: '#000000',
                height: .5,
                borderColor : '#000000'
            }}/>
            <div key={topic.id}>
                <p>{topic.coordinates.city} - {topic.title}</p>
                <p>{topic.content}</p>
                <p>{topic.comments === null ? 0 : topic.comments.length} comment(s)</p>
                <p><a><img style={{ width: "50px" }} src={topic.user.profile_picture}></img> {topic.user.username}</a> | {timeAgo}</p>
            </div>
      </>
    );
  }
}

export default Topic;
