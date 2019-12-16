
import sklearn_crfsuite
import warnings
import joblib
from helpers.logger import formatLogger
logger = formatLogger(__name__)
import spacy


class EntityExtractor:
    function_dict = {
        "low": lambda doc: doc[0].lower(),  # pytype: disable=attribute-error
        "title": lambda doc: doc[0].istitle(),  # pytype: disable=attribute-error
        "prefix5": lambda doc: doc[0][:5],
        "prefix2": lambda doc: doc[0][:2],
        "suffix5": lambda doc: doc[0][-5:],
        "suffix3": lambda doc: doc[0][-3:],
        "suffix2": lambda doc: doc[0][-2:],
        "suffix1": lambda doc: doc[0][-1:],
        "pos": lambda doc: doc[1],
        "pos2": lambda doc: doc[1][:2],
        "bias": lambda doc: "bias",
        "upper": lambda doc: doc[0].isupper(),  # pytype: disable=attribute-error
        "digit": lambda doc: doc[0].isdigit(),  # pytype: disable=attribute-error
        "pattern": lambda doc: doc[3],
        "ner_features": lambda doc: doc[4],
    }

    """
    Performs NER training, prediction, model import/export
    """
    def __init__(self, synonyms=[]):
        self.synonyms = synonyms
        self.nlp = spacy.load("en_core_web_sm")
        self.use_ner_features = None
        self.BILOU_flag = True
        self.pos_features = True
        self.configFeatures = [
            ["low", "title", "upper"],
            [
                "bias",
                "low",
                "prefix5",
                "prefix2",
                "suffix5",
                "suffix3",
                "suffix2",
                "upper",
                "title",
                "digit",
                # "pattern",
            ],
            ["low", "title", "upper"],
        ]



    def replace_synonyms(self, entities):
        """
        replace extracted entity values with
        root word by matching with synonyms dict.
        :param entities:
        :return:
        """
        for entity in entities.keys():
            entity_value = str(entities[entity])
            if entity_value.lower() in self.synonyms:
                entities[entity] = self.synonyms[entity_value.lower()]

        return entities



    def _sentence_to_features(self,sentence):
        """Convert a word into discrete features in self.crf_features,
        including word before and word after."""

        configured_features = self.configFeatures
        sentence_features = []

        for word_idx in range(len(sentence)):
            # word before(-1), current word(0), next word(+1)
            feature_span = len(configured_features)
            half_span = feature_span // 2
            feature_range = range(-half_span, half_span + 1)
            prefixes = [str(i) for i in feature_range]
            word_features = {}
            for f_i in feature_range:
                if word_idx + f_i >= len(sentence):
                    word_features["EOS"] = True
                    # End Of Sentence
                elif word_idx + f_i < 0:
                    word_features["BOS"] = True
                    # Beginning Of Sentence
                else:
                    word = sentence[word_idx + f_i]
                    f_i_from_zero = f_i + half_span
                    prefix = prefixes[f_i_from_zero]
                    features = configured_features[f_i_from_zero]
                    for feature in features:
                        if feature == "pattern":
                            # add all regexes as a feature
                            regex_patterns = self.function_dict[feature](word)
                            # pytype: disable=attribute-error
                            for p_name, matched in regex_patterns.items():
                                feature_name = prefix + ":" + feature + ":" + p_name
                                word_features[feature_name] = matched
                            # pytype: enable=attribute-error
                        else:
                            # append each feature to a feature vector
                            value = self.function_dict[feature](word)
                            word_features[prefix + ":" + feature] = value
            sentence_features.append(word_features)
        return sentence_features


    def _sentence_to_labels(self,sentence):
        return [label for _, _, label, _, _ in sentence]


    # def sent2tokens(self, sent):
    #     return [token for token, postag, label in sent]

    
    def train(self, training_data, model_name):
        """
        Train NER model for given model
        :param train_sentences:
        :param model_name:
        :return:
        """
        dataset = []
        for example in training_data:
            entity_offsets = self._convert_example(example)
            dataset.append(self._from_json_to_crf(example, entity_offsets))

        features = [self._sentence_to_features(s) for s in dataset]
        labels = [self._sentence_to_labels(s) for s in dataset]
        trainer = sklearn_crfsuite.CRF(
            algorithm="lbfgs",
            # coefficient for L1 penalty
            c1=0.1,
            # coefficient for L2 penalty
            c2=0.1,
            # stop earlier
            max_iterations=50,
            # include transitions that are possible, but not observed
            all_possible_transitions=True,
        )
        trainer.fit(features, labels)
        joblib.dump(trainer, 'core/agent/model_files/%s.model' % model_name)
        return True


    def _convert_example(self,example):
        def convert_entity(entity):
            return entity["begin"], entity["end"], entity["name"]
        return [convert_entity(ent) for ent in example.get("entities", [])]



    def _from_json_to_crf(self, message, entity_offsets):
        """Convert json examples to format of underlying crfsuite."""
        if self.pos_features:
            from spacy.gold import GoldParse  # pytype: disable=import-error

            doc_or_tokens = self.nlp(message["text"])
            gold = GoldParse(doc_or_tokens, entities=entity_offsets)
            ents = [l[5] for l in gold.orig_annot]
        else:
            doc_or_tokens = message.get("tokens")
            # ents = self._bilou_tags_from_offsets(doc_or_tokens, entity_offsets)
        # collect badly annotated examples
        collected = []
        for t, e in zip(doc_or_tokens, ents):
            if e == "-":
                collected.append(t)
            elif collected:
                collected_text = " ".join([t.text for t in collected])
                sentence = message['text']
                warnings.warn(
                    f"Misaligned entity annotation for '{collected_text}' "
                    f"in sentence '{sentence}' with intent "
                    f"intent "
                    f"Make sure the start and end values of the "
                    f"annotated training examples end at token "
                    f"boundaries (e.g. don't include trailing "
                    f"whitespaces or punctuation)."
                )
                collected = []

        if not self.BILOU_flag:
            for i, label in enumerate(ents):
                if self._bilou_from_label(label) in {"B", "I", "U", "L"}:
                    # removes BILOU prefix from label
                    ents[i] = self._entity_from_label(label)
        return self._from_text_to_crf(message, ents)

    


    def extract_ner_labels(self, predicted_labels):
        # Extract name of labels from NER
        # :param predicted_labels:
        # :return:
        labels = []
        for tp in predicted_labels:
            if tp != "O":
                labels.append(tp[2:])
        return labels



    def _from_text_to_crf(self, message, entities=None):
        """Takes a sentence and switches it to crfsuite format."""
        crf_format = []
        tokens = self.nlp(message["text"])    
        for i, token in enumerate(tokens):
            pattern = {}
            entity = entities[i] if entities else "N/A"
            tag =  None
            custom_ner_features = None
            crf_format.append((token.text, tag, entity, pattern, custom_ner_features))
        return crf_format


    def _from_crf_to_json(self, message, entities):
        # if self.pos_features:
        #     tokens = message.get("spacy_doc")
        # else:
        # tokens = message.get("tokens")
        tokens = message
        if len(tokens) != len(entities):
            raise Exception(
                "Inconsistency in amount of tokens between crfsuite and message"
         )
        if self.BILOU_flag:
            return self._convert_bilou_tagging_to_entity_result(message, tokens, entities)
        else:
            # not using BILOU tagging scheme, multi-word entities are split.
            return self._convert_simple_tagging_to_entity_result(tokens, entities)



    def _convert_simple_tagging_to_entity_result(self, tokens, entities):
        json_ents = []
        for word_idx in range(len(tokens)):
            entity_label, confidence = self.most_likely_entity(word_idx, entities)
            word = tokens[word_idx]
            if entity_label != "O":
                if self.pos_features:
                    start = word.idx
                    end = word.idx + len(word)
                else:
                    start = word.offset
                    end = word.end
                ent = {
                    "start": start,
                    "end": end,
                    "value": word.text,
                    "entity": entity_label,
                    "confidence": confidence,
                }
                json_ents.append(ent)
        return json_ents
    


    def most_likely_entity(self, idx, entities):
        if len(entities) > idx:
            entity_probs = entities[idx]
        else:
            entity_probs = None
        if entity_probs:
            label = max(entity_probs, key=lambda key: entity_probs[key])
            if self.BILOU_flag:
                # if we are using bilou flags, we will combine the prob
                # of the B, I, L and U tags for an entity (so if we have a
                # score of 60% for `B-address` and 40% and 30%
                # for `I-address`, we will return 70%)
                return (
                    label,
                    sum([v for k, v in entity_probs.items() if k[2:] == label[2:]]),
                )
            else:
                return label, entity_probs[label]
        else:
            return "", 0.0


    @staticmethod
    def _entity_from_label(label):
        return label[2:]


    def _handle_bilou_label(self, word_idx , entities):
        label, confidence = self.most_likely_entity(word_idx, entities)
        entity_label = self._entity_from_label(label)

        if self._bilou_from_label(label) == "U":
            return word_idx, confidence, entity_label

        elif self._bilou_from_label(label) == "B":
            # start of multi word-entity need to represent whole extent
            ent_word_idx, confidence = self._find_bilou_end(word_idx, entities)
            return ent_word_idx, confidence, entity_label

        else:
            return None, None, None


    @staticmethod
    def _bilou_from_label(label):
        if len(label) >= 2 and label[1] == "-":
            return label[0].upper()
        return None


    def _find_bilou_end(self, word_idx, entities):
        ent_word_idx = word_idx + 1
        finished = False

        # get information about the first word, tagged with `B-...`
        label, confidence = self.most_likely_entity(word_idx, entities)
        entity_label = self._entity_from_label(label)

        while not finished:
            label, label_confidence = self.most_likely_entity(ent_word_idx, entities)

            confidence = min(confidence, label_confidence)

            if label[2:] != entity_label:
                # words are not tagged the same entity class
                logger.debug(
                    "Inconsistent BILOU tagging found, B- tag, L- "
                    "tag pair encloses multiple entity classes.i.e. "
                    "[B-a, I-b, L-a] instead of [B-a, I-a, L-a].\n"
                    "Assuming B- class is correct."
                )

            if label.startswith("L-"):
                # end of the entity
                finished = True
            elif label.startswith("I-"):
                # middle part of the entity
                ent_word_idx += 1
            else:
                # entity not closed by an L- tag
                finished = True
                ent_word_idx -= 1
                logger.debug(
                    "Inconsistent BILOU tagging found, B- tag not "
                    "closed by L- tag, i.e [B-a, I-a, O] instead of "
                    "[B-a, L-a, O].\nAssuming last tag is L-"
                )
        return ent_word_idx, confidence



    def _create_entity_dict(self,message,tokens,start,end,entity,confidence):
        if isinstance(tokens, list):  # tokens is a list of Token
            _start = tokens[start].offset
            _end = tokens[end].end
            value = tokens[start].text
            value += "".join(
                [
                    message.text[tokens[i - 1].end : tokens[i].offset] + tokens[i].text
                    for i in range(start + 1, end + 1)
                ]
            )
        else:  # tokens is a Doc
            _start = tokens[start].idx
            _end = tokens[start : end + 1].end_char
            value = tokens[start : end + 1].text

        return {
            "start": _start,
            "end": _end,
            "value": value,
            "entity": entity,
            "confidence": confidence,
        }


    def _convert_bilou_tagging_to_entity_result(self, message, tokens, entities):
        # using the BILOU tagging scheme
        json_ents = []
        word_idx = 0
        while word_idx < len(tokens):
            end_idx, confidence, entity_label = self._handle_bilou_label(word_idx, entities)
            if end_idx is not None:
                ent = self._create_entity_dict(message, tokens, word_idx, end_idx, entity_label, confidence)
                json_ents.append(ent)
                word_idx = end_idx + 1
            else:
                word_idx += 1
        return json_ents



    def predict(self, model_name, sentence):
        """
        Predict NER labels for given model and query
        :param model_name:
        :param sentence:
        :return:
        """
        tagger = joblib.load('core/agent/model_files/%s.model' % model_name)
        sentencetoJson = {"text":sentence}
        text_data = self._from_text_to_crf(sentencetoJson)
        features = self._sentence_to_features(text_data)
        ents = tagger.predict_marginals_single(features)
        extracted_entities = self._from_crf_to_json(self.nlp(sentence), ents)
        print("*****************")
        for entity in extracted_entities:
            thisentity = entity["entity"]+" - "+entity["value"]
            print(thisentity)
        print("*****************")
        # return self.replace_synonyms(extracted_entities)


