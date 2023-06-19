import React, { Component } from "react";

class Input extends Component {
    render() {
        return (
            <>
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input
                    type={this.props.type}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    name={this.props.name}
                    className={this.props.className}
                />
            </>
        )
    }
}

export default Input;
