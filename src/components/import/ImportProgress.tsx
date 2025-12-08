import { styled } from "goober";
import type { ImportProgressProps } from "../../types/component.types";

export const ImportProgress = ({ progress }: ImportProgressProps) => {
  const percentage = (progress.current / progress.total) * 100;

  return (
    <Container>
      <Title>Importing Repository</Title>

      <ProgressSection>
        <ProgressHeader>
          <ProgressMessage>{progress.message}</ProgressMessage>
          <ProgressCount>
            {progress.current}/{progress.total}
          </ProgressCount>
        </ProgressHeader>

        <ProgressBarContainer>
          <ProgressBarFill $percentage={percentage} />
        </ProgressBarContainer>
      </ProgressSection>

      <StepsBox>
        <StepsTitle>Import Steps:</StepsTitle>
        <StepsList>
          <StepItem $active={progress.current >= 1}>
            {progress.current >= 1 ? "✓" : "○"} Fetch repository metadata
          </StepItem>
          <StepItem $active={progress.current >= 2}>
            {progress.current >= 2 ? "✓" : "○"} Import files
          </StepItem>
          <StepItem $active={progress.current >= 3}>
            {progress.current >= 3 ? "✓" : "○"} Import issues and pull requests
          </StepItem>
          <StepItem $active={progress.current >= 4}>
            {progress.current >= 4 ? "✓" : "○"} Import comments
          </StepItem>
          <StepItem $active={progress.current >= 5}>
            {progress.current >= 5 ? "✓" : "○"} Complete
          </StepItem>
        </StepsList>
      </StepsBox>
    </Container>
  );
};

const Container = styled("div")`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
`;

const Title = styled("h2")`
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const ProgressSection = styled("div")`
  margin-bottom: 10px;
`;

const ProgressHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ProgressMessage = styled("span")`
  font-size: 14px;
  font-weight: 500;
`;

const ProgressCount = styled("span")`
  font-size: 14px;
  color: #666;
`;

const ProgressBarContainer = styled("div")`
  width: 100%;
  height: 8px;
  background-color: #e1e4e8;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled("div")<{ $percentage: number }>`
  width: ${(props) => props.$percentage}%;
  height: 100%;
  background-color: #2da44e;
  transition: width 0.3s ease;
`;

const StepsBox = styled("div")`
  margin-top: 20px;
  padding: 15px;
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 14px;
`;

const StepsTitle = styled("p")`
  margin: 0 0 10px 0;
  font-weight: 500;
`;

const StepsList = styled("ol")`
  margin: 0;
  padding-left: 20px;
`;

const StepItem = styled("li")<{ $active: boolean }>`
  opacity: ${(props) => (props.$active ? 1 : 0.5)};
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }
`;
