import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// 1. Определяем схему (Schema)
const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    year: Int
    author: Author!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
  }

  type Mutation {
    createAuthor(name: String!): Author!
    createBook(title: String!, year: Int, authorId: ID!): Book!
  }
`;

// 2. Данные в памяти
const authors = [
  { id: '1', name: 'Джордж Оруэлл' },
  { id: '2', name: 'Рэй Брэдбери' },
];

const books = [
  { id: '1', title: '1984', year: 1949, authorId: '1' },
  { id: '2', title: 'Скотный двор', year: 1945, authorId: '1' },
  { id: '3', title: '451 градус по Фаренгейту', year: 1953, authorId: '2' },
];

// 3. Определяем резолверы
const resolvers = {
  Query: {
    // Получение всех книг
    books: () => books,
    // Получение одной книги по id
    book: (_, { id }) => books.find(b => b.id === id),
    // Получение всех авторов
    authors: () => authors,
  },
  
  Mutation: {
    // Создание автора
    createAuthor: (_, { name }) => {
      const author = { id: String(authors.length + 1), name };
      authors.push(author);
      return author;
    },
    // Создание книги
    createBook: (_, { title, year, authorId }) => {
      const book = { id: String(books.length + 1), title, year, authorId };
      books.push(book);
      return book;
    },
  },

  // Вложенные резолверы для связей
  Author: {
    // Поле books в типе Author
    books: (parent) => books.filter(b => b.authorId === parent.id),
  },
  
  Book: {
    // Поле author в типе Book
    author: (parent) => authors.find(a => a.id === parent.authorId),
  },
};

// 4. Запускаем сервер
const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 GraphQL Server ready at: ${url}`);
