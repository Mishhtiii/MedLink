const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    role: String!
  }

  type Doctor {
    id: ID!
    name: String!
    username: String!
    email: String!
    field: String!
    qualification: String!
    experience: String!
    rating: Float!
    location: String!
    img: String!
  }

  type Appointment {
    id: ID!
    userId: ID!
    doctorId: ID!
    date: String!
    time: String!
    status: String!
  }

  type Query {
    doctors: [Doctor!]!
    doctor(id: ID!): Doctor
    appointments(userId: ID!): [Appointment!]!
  }

  type Mutation {
    createAppointment(
      doctorId: ID!
      date: String!
      time: String!
    ): Appointment!
  }
`;

module.exports = typeDefs;

