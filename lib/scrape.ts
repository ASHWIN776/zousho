import { NodeHtmlMarkdown } from "node-html-markdown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export const scrape = async (url: string) => {
  const res = await fetch(url);
  const text = await res.text();

  // Parse the HTML content with Readability
  const dom = new JSDOM(text);
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Failed to parse article");
  }

  // Translate the HTML content to markdown
  const markdown = NodeHtmlMarkdown.translate(article.content);

  // Remove the newlines from the markdown
  return {
    title: article.title,
    markdown: markdown.replace(/\n/g, "")
  }
}