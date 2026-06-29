const graphqlConfig = {
  projects: {
    default: {
      schema: "src/graphql/index.ts",
      documents: "src/**/*.{ts,tsx}",
    },
  },
};

export default graphqlConfig;
