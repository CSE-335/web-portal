import { Button, Container, Text, Title } from "@mantine/core";

export default function Home() {
  return (
    <Container py="xl">
      <Title>CSE 335</Title>
      <Text mt="md">Welcome to the CSE 335 project.</Text>
      <Button mt="xl">Get Started</Button>
    </Container>
  );
}
