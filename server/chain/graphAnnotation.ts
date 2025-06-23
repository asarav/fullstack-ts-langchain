import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  summary: Annotation<string>({
    reducer: (_, action) => action,
    default: () => "",
  }),
});

export { GraphAnnotation };
