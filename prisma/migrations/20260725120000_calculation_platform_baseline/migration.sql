-- Calculation Platform baseline migration
-- Captures pre-existing tables created outside Prisma migration history.
-- This migration must be marked as applied because the schema already exists.
-- No data migration is performed.
-- No destructive DDL is allowed.
--
-- PostgreSQL database dump
--

\restrict qJn009LB8bK62AiNrCgv9fdh00ZcFAZxe458WXyouQeYx7le4HLZZ5fWoqgv9Pr

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10 (Ubuntu 17.10-0ubuntu0.25.10.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calculation_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_audit (
    id text NOT NULL,
    workspace_id text NOT NULL,
    user_id text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    inputs jsonb,
    outputs jsonb,
    formula_version text,
    ai_response jsonb,
    execution_path jsonb,
    error_message text,
    duration_ms integer,
    correlation_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: calculation_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    parent_id text,
    icon text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: calculation_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_certificates (
    id text NOT NULL,
    result_id text NOT NULL,
    certificate_id text NOT NULL,
    calculation_hash text NOT NULL,
    input_hash text NOT NULL,
    formula_version text NOT NULL,
    standard_version text NOT NULL,
    ai_provider text,
    confidence double precision,
    operator text NOT NULL,
    workspace_id text NOT NULL,
    status text DEFAULT 'valid'::text NOT NULL,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: calculation_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_definitions (
    id text NOT NULL,
    category_id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    standard text,
    standard_ref text,
    enabled boolean DEFAULT true NOT NULL,
    ai_review boolean DEFAULT false NOT NULL,
    certificate boolean DEFAULT false NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: calculation_plugins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_plugins (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    version text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: calculation_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_results (
    id text NOT NULL,
    workspace_id text NOT NULL,
    definition_id text,
    version_id text,
    user_id text NOT NULL,
    inputs jsonb NOT NULL,
    outputs jsonb NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    error_message text,
    engine_version text NOT NULL,
    duration_ms integer,
    ai_review jsonb,
    confidence double precision,
    correlation_id text,
    executed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: calculation_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_versions (
    id text NOT NULL,
    definition_id text NOT NULL,
    version text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    dsl_definition jsonb NOT NULL,
    change_log text,
    published_at timestamp(3) without time zone,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: formula_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.formula_definitions (
    id text NOT NULL,
    definition_id text,
    version_id text,
    name text NOT NULL,
    expression text NOT NULL,
    description text,
    return_type text DEFAULT 'number'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: formula_variables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.formula_variables (
    id text NOT NULL,
    formula_id text NOT NULL,
    name text NOT NULL,
    label text,
    type text DEFAULT 'number'::text NOT NULL,
    unit_id text,
    required boolean DEFAULT true NOT NULL,
    default_value jsonb,
    min_value double precision,
    max_value double precision,
    enum_values jsonb,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: unit_conversions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_conversions (
    id text NOT NULL,
    from_unit_id text NOT NULL,
    to_unit_id text NOT NULL,
    factor double precision NOT NULL,
    "offset" double precision DEFAULT 0 NOT NULL,
    formula text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: unit_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_definitions (
    id text NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    symbol text NOT NULL,
    base_unit text NOT NULL,
    factor double precision NOT NULL,
    "offset" double precision DEFAULT 0 NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: calculation_audit calculation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_audit
    ADD CONSTRAINT calculation_audit_pkey PRIMARY KEY (id);


--
-- Name: calculation_categories calculation_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_categories
    ADD CONSTRAINT calculation_categories_pkey PRIMARY KEY (id);


--
-- Name: calculation_certificates calculation_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_certificates
    ADD CONSTRAINT calculation_certificates_pkey PRIMARY KEY (id);


--
-- Name: calculation_definitions calculation_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_definitions
    ADD CONSTRAINT calculation_definitions_pkey PRIMARY KEY (id);


--
-- Name: calculation_plugins calculation_plugins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_plugins
    ADD CONSTRAINT calculation_plugins_pkey PRIMARY KEY (id);


--
-- Name: calculation_results calculation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_results
    ADD CONSTRAINT calculation_results_pkey PRIMARY KEY (id);


--
-- Name: calculation_versions calculation_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_versions
    ADD CONSTRAINT calculation_versions_pkey PRIMARY KEY (id);


--
-- Name: formula_definitions formula_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_definitions
    ADD CONSTRAINT formula_definitions_pkey PRIMARY KEY (id);


--
-- Name: formula_variables formula_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_variables
    ADD CONSTRAINT formula_variables_pkey PRIMARY KEY (id);


--
-- Name: unit_conversions unit_conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_pkey PRIMARY KEY (id);


--
-- Name: unit_definitions unit_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_definitions
    ADD CONSTRAINT unit_definitions_pkey PRIMARY KEY (id);


--
-- Name: calculation_audit_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_audit_action_idx ON public.calculation_audit USING btree (action);


--
-- Name: calculation_audit_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_audit_created_at_idx ON public.calculation_audit USING btree (created_at);


--
-- Name: calculation_audit_entity_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_audit_entity_type_idx ON public.calculation_audit USING btree (entity_type);


--
-- Name: calculation_audit_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_audit_user_id_idx ON public.calculation_audit USING btree (user_id);


--
-- Name: calculation_audit_workspace_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_audit_workspace_id_idx ON public.calculation_audit USING btree (workspace_id);


--
-- Name: calculation_categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX calculation_categories_slug_key ON public.calculation_categories USING btree (slug);


--
-- Name: calculation_certificates_certificate_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_certificates_certificate_id_idx ON public.calculation_certificates USING btree (certificate_id);


--
-- Name: calculation_certificates_certificate_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX calculation_certificates_certificate_id_key ON public.calculation_certificates USING btree (certificate_id);


--
-- Name: calculation_certificates_result_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_certificates_result_id_idx ON public.calculation_certificates USING btree (result_id);


--
-- Name: calculation_certificates_result_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX calculation_certificates_result_id_key ON public.calculation_certificates USING btree (result_id);


--
-- Name: calculation_certificates_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_certificates_status_idx ON public.calculation_certificates USING btree (status);


--
-- Name: calculation_certificates_workspace_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_certificates_workspace_id_idx ON public.calculation_certificates USING btree (workspace_id);


--
-- Name: calculation_definitions_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX calculation_definitions_slug_key ON public.calculation_definitions USING btree (slug);


--
-- Name: calculation_plugins_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX calculation_plugins_slug_key ON public.calculation_plugins USING btree (slug);


--
-- Name: calculation_results_definition_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_results_definition_id_idx ON public.calculation_results USING btree (definition_id);


--
-- Name: calculation_results_executed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_results_executed_at_idx ON public.calculation_results USING btree (executed_at);


--
-- Name: calculation_results_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_results_status_idx ON public.calculation_results USING btree (status);


--
-- Name: calculation_results_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_results_user_id_idx ON public.calculation_results USING btree (user_id);


--
-- Name: calculation_results_workspace_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_results_workspace_id_idx ON public.calculation_results USING btree (workspace_id);


--
-- Name: calculation_versions_definition_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_versions_definition_id_idx ON public.calculation_versions USING btree (definition_id);


--
-- Name: calculation_versions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calculation_versions_status_idx ON public.calculation_versions USING btree (status);


--
-- Name: formula_definitions_definition_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX formula_definitions_definition_id_idx ON public.formula_definitions USING btree (definition_id);


--
-- Name: formula_variables_formula_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX formula_variables_formula_id_idx ON public.formula_variables USING btree (formula_id);


--
-- Name: unit_conversions_from_unit_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unit_conversions_from_unit_id_idx ON public.unit_conversions USING btree (from_unit_id);


--
-- Name: unit_conversions_to_unit_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unit_conversions_to_unit_id_idx ON public.unit_conversions USING btree (to_unit_id);


--
-- Name: calculation_categories calculation_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_categories
    ADD CONSTRAINT calculation_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.calculation_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calculation_definitions calculation_definitions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_definitions
    ADD CONSTRAINT calculation_definitions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.calculation_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: calculation_versions calculation_versions_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_versions
    ADD CONSTRAINT calculation_versions_definition_id_fkey FOREIGN KEY (definition_id) REFERENCES public.calculation_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: formula_variables formula_variables_formula_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_variables
    ADD CONSTRAINT formula_variables_formula_id_fkey FOREIGN KEY (formula_id) REFERENCES public.formula_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: formula_variables formula_variables_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_variables
    ADD CONSTRAINT formula_variables_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.unit_definitions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: unit_conversions unit_conversions_from_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_from_unit_id_fkey FOREIGN KEY (from_unit_id) REFERENCES public.unit_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: unit_conversions unit_conversions_to_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_conversions
    ADD CONSTRAINT unit_conversions_to_unit_id_fkey FOREIGN KEY (to_unit_id) REFERENCES public.unit_definitions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict qJn009LB8bK62AiNrCgv9fdh00ZcFAZxe458WXyouQeYx7le4HLZZ5fWoqgv9Pr
